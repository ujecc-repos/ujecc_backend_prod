import express from 'express';
import { prisma } from '../utils/client';

const router = express.Router()

/**
 * Créer une présence pour un utilisateur et un événement
 */
router.post("/", async (req, res) => {
  const { utilisateurId, serviceId, statut, attendanceDate } = req.body;
  const offlineOperationId = typeof req.body.offlineOperationId === 'string'
    ? req.body.offlineOperationId.trim().slice(0, 191)
    : undefined;
  try {
    if (offlineOperationId) {
      const previousAttempt = await prisma.presence.findUnique({
        where: { offlineOperationId },
        include: { user: true, service: true },
      });
      if (previousAttempt) {
        return res.json({ ...previousAttempt, deduplicated: true });
      }
    }

    // Preserve the calendar day on which attendance was marked offline.
    const validAttendanceDate = typeof attendanceDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(attendanceDate)
      ? attendanceDate
      : new Date().toISOString().slice(0, 10);
    const markedDate = new Date(`${validAttendanceDate}T12:00:00.000Z`);
    const startOfDay = new Date(`${validAttendanceDate}T00:00:00.000Z`);
    const endOfDay = new Date(`${validAttendanceDate}T23:59:59.999Z`);

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
      return res.status(409).json({
        error: "Vous avez déjà marqué votre présence pour ce service aujourd'hui",
        code: 'PRESENCE_ALREADY_EXISTS'
      });
    }

    // Create the presence if no duplicate found
    const presence = await prisma.presence.create({
      data: {
        utilisateurId,
        serviceId,
        statut,
        createdAt: markedDate,
        offlineOperationId: offlineOperationId || null,
      },
      include: { user: true, service: true },
    });
    res.json(presence);
  } catch (err) {
    if (offlineOperationId) {
      const previousAttempt = await prisma.presence.findUnique({
        where: { offlineOperationId },
        include: { user: true, service: true },
      });
      if (previousAttempt) {
        return res.json({ ...previousAttempt, deduplicated: true });
      }
    }
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
    date = '',
    userId = ''
  } = req.query;

  try {
    // Parse pagination parameters
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;


    // Build where clause with filters
    const whereClause: any = { serviceId: id };

    // Check if user has ministry restrictions
    if (userId && userId !== '') {
      const currentUser = await prisma.user.findUnique({
        where: { id: userId as string },
        select: { role: true, ministryId: true }
      });

      // console.log("current user : ", currentUser, currentUser?.ministryId, currentUser?.role)
      // If user is "Leader" or has a ministry assigned, filter by ministry
      if (currentUser && (currentUser.role === 'Leader' || currentUser.ministryId)) {
        whereClause.user = {
          ...whereClause.user,
          ministryId: currentUser.ministryId
        };
      }
    }

    // Add search filter for user firstname, lastname, or email
    if (search && search !== '') {
      whereClause.user = {
        ...whereClause.user,
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
