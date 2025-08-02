"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("../utils/client");
const router = express_1.default.Router();
// Create a new transfer between churches
router.post('/', async (req, res) => {
    const { userId, fromChurchId, toChurchId, type } = req.body;
    try {
        // Verify that the user exists
        const user = await client_1.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }
        // Verify that both churches exist
        const fromChurch = await client_1.prisma.church.findUnique({
            where: { id: fromChurchId },
        });
        if (!fromChurch) {
            return res.status(404).json({ error: 'Église source non trouvée' });
        }
        const toChurch = await client_1.prisma.church.findUnique({
            where: { id: toChurchId },
        });
        if (!toChurch) {
            return res.status(404).json({ error: 'Église cible non trouvée' });
        }
        // Verify that the user belongs to the source church
        if (user.churchId !== fromChurchId) {
            return res.status(400).json({ error: 'L\'utilisateur n\'appartient pas à l\'église source' });
        }
        // Create the transfer record and update the user's church in a transaction
        const result = await client_1.prisma.$transaction(async (prisma) => {
            // Create the transfer record
            const transfer = await prisma.transfert.create({
                data: {
                    fromChurchId,
                    toChurchId,
                    userId,
                    updatedAt: new Date(),
                },
            });
            // Update the user's church
            const updatedUser = await prisma.user.update({
                where: { id: userId },
                data: {
                    churchId: toChurchId,
                },
            });
            return { transfer, updatedUser };
        });
        res.status(201).json(result);
    }
    catch (error) {
        console.error('Error creating transfer:', error);
        console.log("error : ", error);
        res.status(500).json({ error: error });
    }
});
// Get all transfers
router.get('/', async (req, res) => {
    try {
        const transfers = await client_1.prisma.transfert.findMany({
            include: {
                fromChurch: true,
                toChurch: true,
                member: true,
            },
        });
        res.json(transfers);
    }
    catch (error) {
        console.error('Error fetching transfers:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des transferts' });
    }
});
// Get transfers by church (either as source or destination)
router.get('/church/:churchId', async (req, res) => {
    const { churchId } = req.params;
    try {
        const transfers = await client_1.prisma.transfert.findMany({
            where: {
                OR: [
                    { fromChurchId: churchId },
                    { toChurchId: churchId },
                ],
            },
            include: {
                fromChurch: true,
                toChurch: true,
                member: true,
            },
        });
        res.json(transfers);
    }
    catch (error) {
        console.error('Error fetching transfers for church:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des transferts pour cette église' });
    }
});
// Get a single transfer by ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const transfer = await client_1.prisma.transfert.findUnique({
            where: { id },
            include: {
                fromChurch: true,
                toChurch: true,
                member: true,
            },
        });
        if (!transfer) {
            return res.status(404).json({ error: 'Transfert non trouvé' });
        }
        res.json(transfer);
    }
    catch (error) {
        console.error('Error fetching transfer:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération du transfert' });
    }
});
exports.default = router;
