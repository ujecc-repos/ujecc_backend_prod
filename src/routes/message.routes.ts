import express from 'express';
import fs from 'fs/promises';
import jwt from 'jsonwebtoken';
import path from 'path';
import upload from '../utils/upload';
import { prisma } from '../utils/client';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fkhdlhfjdl389484934893lhfjd938439843949hjfdh384934343434344894jkjkfdjfjd378434jkfdf';

interface AuthenticatedRequest extends express.Request {
  user?: { id: string; email?: string };
}

const authenticate = (req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authentification requise' });
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET) as { id: string; email?: string };
    next();
  } catch {
    return res.status(401).json({ message: 'Session invalide ou expirée' });
  }
};

const userPreview = {
  id: true,
  firstname: true,
  lastname: true,
  email: true,
  role: true,
  picture: true,
  church: { select: { name: true } },
} as const;

router.use(authenticate);

const ensureConversationMembership = async (conversationId: string, userId: string) =>
  prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId } },
  });

const removeMessageAttachment = async (attachmentUrl?: string | null) => {
  if (!attachmentUrl) return;

  const filename = path.basename(attachmentUrl);
  if (!filename) return;

  try {
    await fs.unlink(path.join(__dirname, '../../uploads', filename));
  } catch (error: any) {
    if (error?.code !== 'ENOENT') {
      console.warn('Unable to remove message attachment:', error);
    }
  }
};

// Search active users when starting a new conversation.
router.get('/users', async (req: AuthenticatedRequest, res) => {
  try {
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';

    // Never expose or scan the full directory. Contact discovery only begins
    // after a meaningful query and always returns a tightly capped result set.
    if (search.length < 2) {
      return res.json([]);
    }

    const searchTerms = search.split(/\s+/).filter(Boolean).slice(0, 3);
    const users = await prisma.user.findMany({
      where: {
        id: { not: req.user!.id },
        membreActif: true,
        AND: searchTerms.map((term) => ({
          OR: [
            { firstname: { startsWith: term } },
            { lastname: { startsWith: term } },
            { email: { startsWith: term } },
          ],
        })),
      },
      select: userPreview,
      orderBy: [{ firstname: 'asc' }, { lastname: 'asc' }],
      take: 20,
    });

    res.json(users);
  } catch (error) {
    console.error('Message user search error:', error);
    res.status(500).json({ message: 'Impossible de charger les utilisateurs' });
  }
});

// Return the current user's conversations with preview and unread metadata.
router.get('/conversations', async (req: AuthenticatedRequest, res) => {
  try {
    const conversations = await prisma.conversation.findMany({
      where: { participants: { some: { userId: req.user!.id } } },
      include: {
        participants: { include: { user: { select: userPreview } } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: { sender: { select: userPreview } },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const result = await Promise.all(conversations.map(async (conversation) => {
      const membership = conversation.participants.find((participant) => participant.userId === req.user!.id);
      const unreadCount = await prisma.message.count({
        where: {
          conversationId: conversation.id,
          senderId: { not: req.user!.id },
          createdAt: { gt: membership?.lastReadAt ?? new Date(0) },
        },
      });

      return {
        ...conversation,
        unreadCount,
        lastMessage: conversation.messages[0] ?? null,
        messages: undefined,
      };
    }));

    res.json(result);
  } catch (error) {
    console.error('Conversation list error:', error);
    res.status(500).json({ message: 'Impossible de charger les conversations' });
  }
});

// Start or reopen a direct conversation with another user.
router.post('/conversations', async (req: AuthenticatedRequest, res) => {
  try {
    const { participantId } = req.body;

    if (typeof participantId !== 'string' || participantId === req.user!.id) {
      return res.status(400).json({ message: 'Utilisateur invalide' });
    }

    const participant = await prisma.user.findFirst({
      where: { id: participantId, membreActif: true },
      select: { id: true },
    });
    if (!participant) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    const existing = await prisma.conversation.findFirst({
      where: {
        isGroup: false,
        AND: [
          { participants: { some: { userId: req.user!.id } } },
          { participants: { some: { userId: participantId } } },
        ],
      },
      select: { id: true },
    });

    if (existing) {
      return res.json(existing);
    }

    const conversation = await prisma.conversation.create({
      data: {
        participants: {
          create: [{ userId: req.user!.id }, { userId: participantId }],
        },
      },
      select: { id: true },
    });

    res.status(201).json(conversation);
  } catch (error) {
    console.error('Conversation creation error:', error);
    res.status(500).json({ message: 'Impossible de créer la conversation' });
  }
});

// Create a group conversation. The creator is permanently recorded as the
// group owner and is the only participant allowed to manage membership.
router.post('/conversations/groups', async (req: AuthenticatedRequest, res) => {
  try {
    const title = typeof req.body.title === 'string' ? req.body.title.trim().slice(0, 80) : '';
    const requestedParticipantIds: string[] = Array.isArray(req.body.participantIds)
      ? (req.body.participantIds as unknown[]).filter((id): id is string => typeof id === 'string')
      : [];
    const participantIds = [...new Set(requestedParticipantIds)]
      .filter((id) => id !== req.user!.id)
      .slice(0, 99);

    if (title.length < 2) {
      return res.status(400).json({ message: 'Le nom du groupe doit contenir au moins 2 caractères' });
    }
    if (participantIds.length === 0) {
      return res.status(400).json({ message: 'Ajoutez au moins une personne au groupe' });
    }

    const activeUsers = await prisma.user.findMany({
      where: { id: { in: participantIds }, membreActif: true },
      select: { id: true },
    });

    if (activeUsers.length !== participantIds.length) {
      return res.status(400).json({ message: 'Un ou plusieurs utilisateurs sont invalides ou inactifs' });
    }

    const conversation = await prisma.conversation.create({
      data: {
        title,
        isGroup: true,
        ownerId: req.user!.id,
        participants: {
          create: [req.user!.id, ...activeUsers.map((user) => user.id)].map((userId) => ({ userId })),
        },
      },
      select: { id: true },
    });

    return res.status(201).json(conversation);
  } catch (error) {
    console.error('Group conversation creation error:', error);
    return res.status(500).json({ message: 'Impossible de créer le groupe' });
  }
});

// Add active users to a group. Only its creator/owner can do this.
router.post('/conversations/:conversationId/participants', async (req: AuthenticatedRequest, res) => {
  try {
    const { conversationId } = req.params;
    const requestedParticipantIds: string[] = Array.isArray(req.body.participantIds)
      ? (req.body.participantIds as unknown[]).filter((id): id is string => typeof id === 'string')
      : [];
    const participantIds = [...new Set(requestedParticipantIds)]
      .filter((id) => id !== req.user!.id)
      .slice(0, 99);

    const group = await prisma.conversation.findFirst({
      where: { id: conversationId, isGroup: true },
      select: { id: true, ownerId: true },
    });

    if (!group) {
      return res.status(404).json({ message: 'Groupe introuvable' });
    }
    if (group.ownerId !== req.user!.id) {
      return res.status(403).json({ message: 'Seul l’administrateur du groupe peut ajouter des membres' });
    }
    if (participantIds.length === 0) {
      return res.status(400).json({ message: 'Sélectionnez au moins une personne' });
    }

    const activeUsers = await prisma.user.findMany({
      where: { id: { in: participantIds }, membreActif: true },
      select: { id: true },
    });

    if (activeUsers.length !== participantIds.length) {
      return res.status(400).json({ message: 'Un ou plusieurs utilisateurs sont invalides ou inactifs' });
    }

    await prisma.conversationParticipant.createMany({
      data: activeUsers.map((user) => ({ conversationId, userId: user.id })),
      skipDuplicates: true,
    });

    const updatedGroup = await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
      include: { participants: { include: { user: { select: userPreview } } } },
    });

    return res.json(updatedGroup);
  } catch (error) {
    console.error('Group participant addition error:', error);
    return res.status(500).json({ message: 'Impossible d’ajouter les membres au groupe' });
  }
});

// Remove a participant from a group. The owner cannot remove themselves.
router.delete('/conversations/:conversationId/participants/:participantId', async (req: AuthenticatedRequest, res) => {
  try {
    const { conversationId, participantId } = req.params;
    const group = await prisma.conversation.findFirst({
      where: { id: conversationId, isGroup: true },
      select: { id: true, ownerId: true },
    });

    if (!group) {
      return res.status(404).json({ message: 'Groupe introuvable' });
    }
    if (group.ownerId !== req.user!.id) {
      return res.status(403).json({ message: 'Seul l’administrateur du groupe peut retirer des membres' });
    }
    if (participantId === group.ownerId) {
      return res.status(400).json({ message: 'L’administrateur ne peut pas se retirer du groupe' });
    }

    const result = await prisma.conversationParticipant.deleteMany({
      where: { conversationId, userId: participantId },
    });

    if (result.count === 0) {
      return res.status(404).json({ message: 'Ce membre ne fait pas partie du groupe' });
    }

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    return res.status(204).send();
  } catch (error) {
    console.error('Group participant removal error:', error);
    return res.status(500).json({ message: 'Impossible de retirer ce membre du groupe' });
  }
});

// Delete a direct conversation for all participants. The database cascades to
// participants and messages; uploaded attachments are cleaned up afterwards.
router.delete('/conversations/:conversationId', async (req: AuthenticatedRequest, res) => {
  try {
    const { conversationId } = req.params;
    const membership = await ensureConversationMembership(conversationId, req.user!.id);

    if (!membership) {
      return res.status(403).json({ message: 'Accès refusé à cette conversation' });
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: {
        isGroup: true,
        ownerId: true,
        messages: { select: { attachmentUrl: true } },
      },
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation introuvable' });
    }
    if (conversation.isGroup && conversation.ownerId !== req.user!.id) {
      return res.status(403).json({ message: 'Seul l’administrateur du groupe peut le supprimer' });
    }

    await prisma.conversation.delete({ where: { id: conversationId } });
    await Promise.all(conversation.messages.map((message) => removeMessageAttachment(message.attachmentUrl)));

    return res.status(204).send();
  } catch (error) {
    console.error('Conversation deletion error:', error);
    return res.status(500).json({ message: 'Impossible de supprimer la conversation' });
  }
});

router.get('/conversations/:conversationId/messages', async (req: AuthenticatedRequest, res) => {
  try {
    const { conversationId } = req.params;
    const membership = await prisma.conversationParticipant.findUnique({
      where: { conversationId_userId: { conversationId, userId: req.user!.id } },
    });

    if (!membership) {
      return res.status(403).json({ message: 'Accès refusé à cette conversation' });
    }

    const messages = await prisma.message.findMany({
      where: { conversationId },
      include: { sender: { select: userPreview } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    await prisma.conversationParticipant.update({
      where: { conversationId_userId: { conversationId, userId: req.user!.id } },
      data: { lastReadAt: new Date() },
    });

    res.json(messages.reverse());
  } catch (error) {
    console.error('Message list error:', error);
    res.status(500).json({ message: 'Impossible de charger les messages' });
  }
});

router.post('/conversations/:conversationId/messages', upload.single('attachment'), async (req: AuthenticatedRequest, res) => {
  try {
    const { conversationId } = req.params;
    const content = typeof req.body.content === 'string' ? req.body.content.trim() : '';
    const membership = await prisma.conversationParticipant.findUnique({
      where: { conversationId_userId: { conversationId, userId: req.user!.id } },
    });

    if (!membership) {
      return res.status(403).json({ message: 'Accès refusé à cette conversation' });
    }
    if (!content && !req.file) {
      return res.status(400).json({ message: 'Écrivez un message ou ajoutez une pièce jointe' });
    }

    const [message] = await prisma.$transaction([
      prisma.message.create({
        data: {
          conversationId,
          senderId: req.user!.id,
          content,
          attachmentUrl: req.file ? `/uploads/${req.file.filename}` : null,
          attachmentName: req.file?.originalname ?? null,
          attachmentType: req.file?.mimetype ?? null,
        },
        include: { sender: { select: userPreview } },
      }),
      prisma.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      }),
      prisma.conversationParticipant.update({
        where: { conversationId_userId: { conversationId, userId: req.user!.id } },
        data: { lastReadAt: new Date() },
      }),
    ]);

    res.status(201).json(message);
  } catch (error) {
    console.error('Message send error:', error);
    res.status(500).json({ message: 'Impossible d\'envoyer le message' });
  }
});

// Edit the text of a message. Attachments are preserved and only the original
// sender is allowed to edit their message.
router.patch('/conversations/:conversationId/messages/:messageId', async (req: AuthenticatedRequest, res) => {
  try {
    const { conversationId, messageId } = req.params;
    const content = typeof req.body.content === 'string' ? req.body.content.trim() : '';
    const membership = await ensureConversationMembership(conversationId, req.user!.id);

    if (!membership) {
      return res.status(403).json({ message: 'Accès refusé à cette conversation' });
    }

    const existingMessage = await prisma.message.findFirst({
      where: { id: messageId, conversationId },
      select: { id: true, senderId: true, attachmentUrl: true },
    });

    if (!existingMessage) {
      return res.status(404).json({ message: 'Message introuvable' });
    }
    if (existingMessage.senderId !== req.user!.id) {
      return res.status(403).json({ message: 'Vous pouvez modifier uniquement vos messages' });
    }
    if (!content && !existingMessage.attachmentUrl) {
      return res.status(400).json({ message: 'Le message ne peut pas être vide' });
    }

    const message = await prisma.message.update({
      where: { id: messageId },
      data: { content },
      include: { sender: { select: userPreview } },
    });

    return res.json(message);
  } catch (error) {
    console.error('Message edit error:', error);
    return res.status(500).json({ message: 'Impossible de modifier le message' });
  }
});

// Delete a message permanently. Only the original sender can delete it.
router.delete('/conversations/:conversationId/messages/:messageId', async (req: AuthenticatedRequest, res) => {
  try {
    const { conversationId, messageId } = req.params;
    const membership = await ensureConversationMembership(conversationId, req.user!.id);

    if (!membership) {
      return res.status(403).json({ message: 'Accès refusé à cette conversation' });
    }

    const existingMessage = await prisma.message.findFirst({
      where: { id: messageId, conversationId },
      select: { id: true, senderId: true, attachmentUrl: true },
    });

    if (!existingMessage) {
      return res.status(404).json({ message: 'Message introuvable' });
    }
    if (existingMessage.senderId !== req.user!.id) {
      return res.status(403).json({ message: 'Vous pouvez supprimer uniquement vos messages' });
    }

    await prisma.message.delete({ where: { id: messageId } });
    await removeMessageAttachment(existingMessage.attachmentUrl);

    return res.status(204).send();
  } catch (error) {
    console.error('Message deletion error:', error);
    return res.status(500).json({ message: 'Impossible de supprimer le message' });
  }
});

router.patch('/conversations/:conversationId/read', async (req: AuthenticatedRequest, res) => {
  try {
    const { conversationId } = req.params;
    await prisma.conversationParticipant.update({
      where: { conversationId_userId: { conversationId, userId: req.user!.id } },
      data: { lastReadAt: new Date() },
    });
    res.status(204).send();
  } catch {
    res.status(404).json({ message: 'Conversation introuvable' });
  }
});

export default router;
