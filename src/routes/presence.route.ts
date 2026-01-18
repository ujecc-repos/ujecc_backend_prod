import express from 'express';
import { prisma } from '../utils/client';

const router = express.Router()

/**
 * Créer une présence pour un utilisateur et un événement
 */
router.post("/", async (req, res) => {
  const { utilisateurId, serviceId, statut } = req.body;
  try {
    // Check if user has already marked presence for this service today

    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

    const existingPresence = await prisma.presence.findFirst({
      where: {
        utilisateurId,
        serviceId,
        createdAt: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    });

    if (existingPresence) {
      return res.status(400).json({
        error: "Vous avez déjà marqué votre présence pour ce service aujourd'hui"
      });
    }

    // Create the presence if no duplicate found
    const presence = await prisma.presence.create({
      data: { utilisateurId, serviceId, statut },
      include: { user: true, service: true },
    });
    res.json(presence);
  } catch (err) {
    console.log("error is : ", err)
    res.status(500).json({ error: "Impossible de créer la présence" });
  }
});

router.get("/utilisateurs/:id/presences", async (req, res) => {
  const { id } = req.params;
  try {
    const presences = await prisma.presence.findMany({
      where: { utilisateurId: id },
      include: { service: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(presences);
  } catch (err) {
    res.status(500).json({ error: "Impossible de récupérer les présences" });
  }
});

router.get("/services/:id/presences", async (req, res) => {
  const { id } = req.params;
  const {
    page = '1',
    limit = '10',
    search = '',
    status = '',
    date = ''
  } = req.query;

  try {
    // Parse pagination parameters
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause with filters
    const whereClause: any = { serviceId: id };

    // Add search filter for user firstname, lastname, or email
    if (search && search !== '') {
      whereClause.user = {
        OR: [
          { firstname: { contains: search as string } },
          { lastname: { contains: search as string } },
          { email: { contains: search as string } }
        ]
      };
    }

    // Add status filter
    if (status && status !== '' && status !== 'all') {
      whereClause.statut = status as string;
    }

    // Add date filter for exact date match
    if (date && date !== '') {
      const targetDate = new Date(date as string);
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

      whereClause.createdAt = {
        gte: startOfDay,
        lte: endOfDay
      };
    }

    // Get total count for pagination
    const total = await prisma.presence.count({ where: whereClause });

    // Get paginated presences
    const presences = await prisma.presence.findMany({
      where: whereClause,
      include: { user: true, service: true },
      orderBy: { createdAt: "desc" },
      skip,
      take: limitNum,
    });

    // Calculate total pages
    const totalPages = Math.ceil(total / limitNum);

    // Return paginated response with metadata
    res.json({
      data: presences,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages
      }
    });
  } catch (err) {
    console.log("error is: ", err);
    res.status(500).json({ error: "Impossible de récupérer les présences" });
  }
});

export default router