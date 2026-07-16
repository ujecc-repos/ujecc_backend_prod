import express from 'express';
import jwt from 'jsonwebtoken';
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
