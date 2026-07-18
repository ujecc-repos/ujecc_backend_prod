import { Router, type NextFunction, type Request, type Response } from "express";
import moment from "moment"
import jwt from "jsonwebtoken";
import { prisma } from "../utils/client";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fkhdlhfjdl389484934893lhfjd938439843949hjfdh384934343434344894jkjkfdjfjd378434jkfdf';

const normalizeExternalParticipants = (value: unknown) => {
  if (typeof value !== 'string') return undefined;

  const names = value
    .split(/\r?\n/)
    .map((name) => name.trim())
    .filter(Boolean)
    .slice(0, 100)
    .join('\n');

  return names ? names.slice(0, 5000) : null;
};

declare global {
  namespace Express {
    interface Request {
      appointmentAdmin?: { id: string; churchId: string };
    }
  }
}

const requireChurchAdmin = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Authentification requise' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { id: string };
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, role: true, churchId: true, membreActif: true },
    });

    if (!user?.membreActif) {
      return res.status(403).json({ message: 'Compte indisponible' });
    }
    if (user.role !== 'Admin') {
      return res.status(403).json({ message: 'Cette fonctionnalité est réservée aux administrateurs' });
    }
    if (!user.churchId) {
      return res.status(403).json({ message: 'Votre compte doit être associé à une église' });
    }

    req.appointmentAdmin = { id: user.id, churchId: user.churchId };
    next();
  } catch {
    return res.status(401).json({ message: 'Session invalide ou expirée' });
  }
};

router.use(requireChurchAdmin);

// Create a new appointment
router.post("/", async (req, res) => {
  try {
    const { name, visibility, description, date, time, duration, notes, userIds, externalParticipants } = req.body;
    const churchId = req.appointmentAdmin!.churchId;
    // if (!userIds || userIds.length === 0) {
    //   return res.status(400).json({ error: "At least one user must be assigned" });
    // }

    // if (userIds.length > 3) {
    //   return res.status(400).json({ error: "Maximum of three users can be assigned" });
    // }

    const convert1 = moment(`${date}`, 'YYYY-MM-DD', true);

    const appointment = await prisma.appointment.create({
      data: {
        name,
        visibility,
        description,
        date: convert1.toDate(),
        time,
        duration,
        notes,
        externalParticipants: normalizeExternalParticipants(externalParticipants),
        assignedUsers: {
          connect: (Array.isArray(userIds) ? userIds : []).map((id: string) => ({ id }))
        },
        church: churchId ? {
          connect: { id: churchId }
        } : undefined
      },
      include: {
        assignedUsers: true
      }
    });

    res.status(201).json(appointment);
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

// Get all appointments
router.get("/", async (req, res) => {
  try {
    const appointments = await prisma.appointment.findMany({
      where: { churchId: req.appointmentAdmin!.churchId },
      include: {
        assignedUsers: true
      }
    });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch appointments" });
  }
});

// Get appointments by church ID
router.get("/church/:churchId", async (req, res) => {
  try {
    const { churchId } = req.params;
    if (churchId !== req.appointmentAdmin!.churchId) {
      return res.status(403).json({ message: 'Accès refusé à cette église' });
    }
    const appointments = await prisma.appointment.findMany({
      where: { churchId },
      include: {
        assignedUsers: true
      }
    });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch appointments by church" });
  }
});

// Get appointment by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await prisma.appointment.findFirst({
      where: { id, churchId: req.appointmentAdmin!.churchId },
      include: {
        assignedUsers: true
      }
    });

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    res.json(appointment);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch appointment" });
  }
});

// Update appointment
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, visibility, description, date, time, duration, notes, userIds, externalParticipants } = req.body;

    const existingAppointment = await prisma.appointment.findFirst({
      where: { id, churchId: req.appointmentAdmin!.churchId },
      select: { id: true },
    });
    if (!existingAppointment) {
      return res.status(404).json({ message: 'Rendez-vous introuvable' });
    }

    const appointment = await prisma.appointment.update({
      where: { id },
      data: {
        name,
        visibility,
        description,
        date: new Date(date),
        time,
        duration,
        notes,
        externalParticipants: normalizeExternalParticipants(externalParticipants),
        assignedUsers: {
          set: (Array.isArray(userIds) ? userIds : []).map((id: string) => ({ id }))
        },
        church: req.appointmentAdmin!.churchId ? {
          connect: { id: req.appointmentAdmin!.churchId }
        } : undefined
      },
      include: {
        assignedUsers: true
      }
    });

    res.json(appointment);
  } catch (error) {
    res.status(500).json({ error: "Failed to update appointment" });
  }
});

// Delete appointment
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await prisma.appointment.deleteMany({
      where: { id, churchId: req.appointmentAdmin!.churchId }
    });

    if (result.count === 0) {
      return res.status(404).json({ message: 'Rendez-vous introuvable' });
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete appointment" });
  }
});

export default router;
