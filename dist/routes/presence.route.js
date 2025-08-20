"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("../utils/client");
const router = express_1.default.Router();
/**
 * Créer une présence pour un utilisateur et un événement
 */
router.post("/", async (req, res) => {
    const { utilisateurId, serviceId, statut } = req.body;
    try {
        const presence = await client_1.prisma.presence.create({
            data: { utilisateurId, serviceId, statut },
            include: { user: true, service: true },
        });
        res.json(presence);
    }
    catch (err) {
        console.log("error is : ", err);
        res.status(500).json({ error: "Impossible de créer la présence" });
    }
});
router.get("/utilisateurs/:id/presences", async (req, res) => {
    const { id } = req.params;
    try {
        const presences = await client_1.prisma.presence.findMany({
            where: { utilisateurId: id },
            include: { service: true },
            orderBy: { createdAt: "desc" },
        });
        res.json(presences);
    }
    catch (err) {
        res.status(500).json({ error: "Impossible de récupérer les présences" });
    }
});
router.get("/services/:id/presences", async (req, res) => {
    const { id } = req.params;
    try {
        const presences = await client_1.prisma.presence.findMany({
            where: { serviceId: id },
            include: { user: true, service: true },
            orderBy: { createdAt: "asc" },
        });
        res.json(presences);
    }
    catch (err) {
        res.status(500).json({ error: "Impossible de récupérer les présences" });
    }
});
exports.default = router;
