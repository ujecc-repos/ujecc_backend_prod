import express from 'express';
import { prisma } from '../utils/client';

const router = express.Router()

/**
 * Créer une présence pour un utilisateur et un événement
 */
router.post("/", async (req, res) => {
  const { utilisateurId, serviceId, statut } = req.body;
  try {
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
  try {
    const presences = await prisma.presence.findMany({
      where: { serviceId: id },
      include: { user: true, service: true },
      orderBy: { createdAt: "asc" },
    });
    res.json(presences);
  } catch (err) {
    res.status(500).json({ error: "Impossible de récupérer les présences" });
  }
});

export default router