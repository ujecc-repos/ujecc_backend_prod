"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("../utils/client");
const router = express_1.default.Router();
/**
 * ➕ Créer un événement
 */
router.post("/", async (req, res) => {
    const { nom, churchId } = req.body;
    console.log(nom, churchId);
    try {
        const services = await client_1.prisma.service.create({
            data: { nom, churchId },
        });
        res.json(services);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Impossible de créer l'événement" });
    }
});
/**
 * 📋 Lire tous les événements
 */
router.get("/", async (req, res) => {
    try {
        const services = await client_1.prisma.service.findMany({
            orderBy: { createdAt: "desc" },
        });
        res.json(services);
    }
    catch (err) {
        res.status(500).json({ error: "Impossible de récupérer les événements" });
    }
});
/**
 * 🔍 Lire un événement par ID
 */
router.get("//:id", async (req, res) => {
    const { id } = req.params;
    try {
        const evenement = await client_1.prisma.service.findUnique({
            where: { id },
        });
        if (!evenement) {
            return res.status(404).json({ error: "Événement introuvable" });
        }
        res.json(evenement);
    }
    catch (err) {
        res.status(500).json({ error: "Impossible de récupérer l'événement" });
    }
});
/**
 * ✏️ Mettre à jour un événement
 */
router.put("//:id", async (req, res) => {
    const { id } = req.params;
    const { nom } = req.body;
    try {
        const service = await client_1.prisma.service.update({
            where: { id },
            data: { nom },
        });
        res.json(service);
    }
    catch (err) {
        res.status(500).json({ error: "Impossible de mettre à jour l'événement" });
    }
});
/**
 * 🗑️ Supprimer un événement
 */
router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        await client_1.prisma.service.delete({
            where: { id },
        });
        res.json({ message: "Événement supprimé avec succès" });
    }
    catch (err) {
        res.status(500).json({ error: "Impossible de supprimer l'événement" });
    }
});
/**
 * 🏛️ Lire tous les services par église
 */
router.get("/church/:churchId", async (req, res) => {
    const { churchId } = req.params;
    try {
        const services = await client_1.prisma.service.findMany({
            where: { churchId },
            orderBy: { createdAt: "desc" },
        });
        res.json(services);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Impossible de récupérer les services de l'église" });
    }
});
exports.default = router;
