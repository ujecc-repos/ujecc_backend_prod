import express from 'express';
import { prisma } from '../utils/client';
import moment from "moment" 
import upload from '../utils/upload';
import path from 'path';
import jwt from 'jsonwebtoken';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fkhdlhfjdl389484934893lhfjd938439843949hjfdh384934343434344894jkjkfdjfjd378434jkfdf';

declare global {
  namespace Express {
    interface Request {
      funeralAdmin?: { id: string; churchId: string };
    }
  }
}

const requireChurchAdmin = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Authentification requise' });

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { id: string };
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, role: true, churchId: true, membreActif: true },
    });

    if (!user?.membreActif) return res.status(403).json({ message: 'Compte indisponible' });
    if (user.role !== 'Admin') {
      return res.status(403).json({ message: 'Cette fonctionnalité est réservée aux administrateurs' });
    }
    if (!user.churchId) {
      return res.status(403).json({ message: 'Votre compte doit être associé à une église' });
    }

    req.funeralAdmin = { id: user.id, churchId: user.churchId };
    next();
  } catch {
    return res.status(401).json({ message: 'Session invalide ou expirée' });
  }
};

const memberPreview = {
  id: true,
  code: true,
  firstname: true,
  lastname: true,
  birthDate: true,
  mobilePhone: true,
  email: true,
  picture: true,
} as const;

const cleanString = (value: unknown, maxLength = 191) =>
  typeof value === 'string' ? value.trim().slice(0, maxLength) : '';

const parseRequiredDate = (value: unknown) => {
  const parsed = moment(cleanString(value, 10), 'YYYY-MM-DD', true);
  return parsed.isValid() ? parsed.toDate() : null;
};

// Search only after input, only inside the administrator's church, and never
// return the complete member directory.
router.get('/member-search', requireChurchAdmin, async (req, res) => {
  try {
    const query = cleanString(req.query.query, 80);
    if (query.length < 2) return res.json([]);

    const terms = query.split(/\s+/).filter(Boolean).slice(0, 3);
    const members = await prisma.user.findMany({
      where: {
        churchId: req.funeralAdmin!.churchId,
        membreActif: true,
        AND: terms.map((term) => ({
          OR: [
            { firstname: { startsWith: term } },
            { lastname: { startsWith: term } },
            { code: { startsWith: term } },
            { mobilePhone: { contains: term } },
          ],
        })),
      },
      select: memberPreview,
      orderBy: [{ firstname: 'asc' }, { lastname: 'asc' }],
      take: 20,
    });

    return res.json(members);
  } catch (error) {
    console.error('Funeral member search error:', error);
    return res.status(500).json({ message: 'Impossible de rechercher les membres' });
  }
});

// Create a new funeral record
router.post('/', requireChurchAdmin, upload.fields([
  { name: 'deathCertificate', maxCount: 1 }
]), async (req, res) => {
  try {
    const birthDate = parseRequiredDate(req.body.birthDate);
    const deathDate = parseRequiredDate(req.body.deathDate);
    const funeralDate = parseRequiredDate(req.body.funeralDate);
    const memberId = cleanString(req.body.memberId) || null;

    if (!birthDate || !deathDate || !funeralDate) {
      return res.status(400).json({ message: 'Les dates de naissance, décès et funérailles sont obligatoires' });
    }
    if (funeralDate < deathDate) {
      return res.status(400).json({ message: 'La date des funérailles doit suivre la date du décès' });
    }

    // Handle file uploads
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    
    // Get file path if it exists
    const deathCertificatePath = files?.deathCertificate ? 
      `/uploads/${path.basename(files.deathCertificate[0].path)}` : null;
    
    const funeral = await prisma.$transaction(async (tx) => {
      let selectedMember: any = null;

      if (memberId) {
        selectedMember = await tx.user.findFirst({
          where: {
            id: memberId,
            churchId: req.funeralAdmin!.churchId,
            membreActif: true,
          },
        });

        if (!selectedMember) {
          throw new Error('MEMBER_NOT_AVAILABLE');
        }
      }

      const createdFuneral = await tx.funeral.create({
        data: {
          fullname: selectedMember
            ? `${selectedMember.firstname} ${selectedMember.lastname}`.trim()
            : cleanString(req.body.fullname),
          birthDate,
          deathDate,
          funeralDate,
          funeralTime: cleanString(req.body.funeralTime),
          relationShip: cleanString(req.body.relationShip),
          email: cleanString(req.body.email),
          telephone: cleanString(req.body.telephone),
          nextOfKin: cleanString(req.body.nextOfKin),
          officiantName: cleanString(req.body.officiantName),
          description: cleanString(req.body.description, 5000),
          funeralLocation: cleanString(req.body.funeralLocation),
          status: cleanString(req.body.status) || 'en attente',
          deathCertificate: deathCertificatePath,
          church: { connect: { id: req.funeralAdmin!.churchId } },
          ...(selectedMember ? { member: { connect: { id: selectedMember.id } } } : {}),
        },
        include: { member: { select: memberPreview }, church: true },
      });

      if (selectedMember) {
        await tx.user.update({
          where: { id: selectedMember.id },
          data: { membreActif: false, deceasedAt: deathDate },
        });
      }

      return createdFuneral;
    });

    res.json(funeral);
  } catch (error: any) {
    console.error('Error creating funeral record:', error);
    if (error?.message === 'MEMBER_NOT_AVAILABLE') {
      return res.status(409).json({ message: 'Ce membre est introuvable, déjà inactif ou appartient à une autre église' });
    }
    if (error?.code === 'P2002') {
      return res.status(409).json({ message: 'Une funéraille est déjà associée à ce membre' });
    }
    res.status(400).json({ message: 'Impossible de créer la funéraille' });
  }
});

// Get all funeral records
router.get('/', async (req, res) => {
  try {
    const funerals = await prisma.funeral.findMany({
      include: {
        church: true,
        member: { select: memberPreview },
      }
    });
    res.json(funerals);
  } catch (error) {
    res.status(400).json({ error: 'Failed to fetch funeral records' });
  }
});

// Get a single funeral record by ID
router.get('/:id', async (req, res) => {
  try {
    const funeral = await prisma.funeral.findUnique({
      where: { id: req.params.id },
      include: {
        church: true,
        member: { select: memberPreview },
      }
    });
    if (!funeral) {
      return res.status(404).json({ error: 'Funeral record not found' });
    }
    res.json(funeral);
  } catch (error) {
    res.status(400).json({ error: 'Failed to fetch funeral record' });
  }
});

// Update a funeral record
router.put('/:id', requireChurchAdmin, upload.fields([
  { name: 'deathCertificate', maxCount: 1 }
]), async (req, res) => {
  try {
    const existingFuneral = await prisma.funeral.findFirst({
      where: { id: req.params.id, churchId: req.funeralAdmin!.churchId },
      select: { id: true, memberId: true },
    });
    if (!existingFuneral) return res.status(404).json({ message: 'Funéraille introuvable' });

    // Handle dates if present
    let updateData: any = { ...req.body };
    delete updateData.memberId;
    delete updateData.churchId;
    
    if (req.body.birthDate) {
      const convertedBirthDate = moment(req.body.birthDate, 'YYYY-MM-DD', true);
      updateData.birthDate = convertedBirthDate.toDate();
    }
    
    if (req.body.funeralDate) {
      const convertedFuneralDate = moment(req.body.funeralDate, 'YYYY-MM-DD', true);
      updateData.funeralDate = convertedFuneralDate.toDate();
    }

    if (req.body.deathDate) {
      const convertedDeathDate = moment(req.body.deathDate, 'YYYY-MM-DD', true);
      updateData.deathDate = convertedDeathDate.toDate();
    }
    
    // Handle file uploads
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    
    // Get file path if it exists
    if (files?.deathCertificate) {
      updateData.deathCertificate = `/uploads/${path.basename(files.deathCertificate[0].path)}`;
    }
    
    const funeral = await prisma.$transaction(async (tx) => {
      const updatedFuneral = await tx.funeral.update({
        where: { id: req.params.id },
        data: updateData,
        include: { member: { select: memberPreview }, church: true },
      });

      if (existingFuneral.memberId && updateData.deathDate) {
        await tx.user.update({
          where: { id: existingFuneral.memberId },
          data: { deceasedAt: updateData.deathDate, membreActif: false },
        });
      }

      return updatedFuneral;
    });
    
    res.json(funeral);
  } catch (error) {
    console.error('Error updating funeral record:', error);
    res.status(400).json({ error: 'Failed to update funeral record' });
  }
});

// Delete a funeral record
router.delete('/:id', requireChurchAdmin, async (req, res) => {
  try {
    const funeral = await prisma.funeral.findFirst({
      where: { id: req.params.id, churchId: req.funeralAdmin!.churchId },
      select: { id: true },
    });
    if (!funeral) return res.status(404).json({ message: 'Funéraille introuvable' });
    await prisma.funeral.delete({ where: { id: funeral.id } });
    res.json({ message: 'Funeral record deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete funeral record' });
  }
});

// Get funeral records by church ID
router.get('/church/:churchId', async (req, res) => {
  try {
    const funerals = await prisma.funeral.findMany({
      where: { churchId: req.params.churchId },
      include: {
        church: true,
        member: { select: memberPreview },
      }
    });
    res.json(funerals);
  } catch (error) {
    res.status(400).json({ error: 'Failed to fetch church funeral records' });
  }
});

// Get funerals by date range
router.get('/date-range', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const funerals = await prisma.funeral.findMany({
      where: {
        funeralDate: {
          gte: new Date(startDate as string),
          lte: new Date(endDate as string)
        }
      },
      include: {
        church: true
      }
    });
    res.json(funerals);
  } catch (error) {
    res.status(400).json({ error: 'Failed to fetch funerals by date range' });
  }
});

export default router;
