"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("../utils/client");
const router = express_1.default.Router();
// Create a new sanction
router.post('/', async (req, res) => {
    try {
        const sanctionData = req.body;
        const sanction = await client_1.prisma.sanction.create({
            data: {
                name: sanctionData.name,
                description: sanctionData.description,
                startDate: sanctionData.startDate,
                status: sanctionData.status,
                church: {
                    connect: {
                        id: sanctionData.churchId
                    }
                }
            }
        });
        res.json(sanction);
    }
    catch (error) {
        console.log("error : ", error);
        res.status(400).json({ error: "Erreur lors de la création du sanction" });
    }
});
// Get all sanctions
router.get('/', async (req, res) => {
    try {
        const sanctions = await client_1.prisma.sanction.findMany({
            include: {
                church: true
            }
        });
        res.json(sanctions);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to fetch sanctions' });
    }
});
// Get a single sanction by ID
router.get('/:id', async (req, res) => {
    try {
        const sanction = await client_1.prisma.sanction.findUnique({
            where: { id: req.params.id },
            include: {
                church: true
            }
        });
        if (!sanction) {
            return res.status(404).json({ error: 'Sanction not found' });
        }
        res.json(sanction);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to fetch sanction' });
    }
});
// Update a sanction
router.put('/:id', async (req, res) => {
    try {
        const sanction = await client_1.prisma.sanction.update({
            where: { id: req.params.id },
            data: req.body
        });
        res.json(sanction);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to update sanction' });
    }
});
// Delete a sanction
router.delete('/:id', async (req, res) => {
    try {
        await client_1.prisma.sanction.delete({
            where: { id: req.params.id }
        });
        res.json({ message: 'Sanction deleted successfully' });
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to delete sanction' });
    }
});
// Get sanctions by church ID
router.get('/church/:churchId', async (req, res) => {
    try {
        const sanctions = await client_1.prisma.sanction.findMany({
            where: { churchId: req.params.churchId },
            include: {
                church: true
            }
        });
        res.json(sanctions);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to fetch sanctions for this church' });
    }
});
// Get sanctions by status
router.get('/status/:status', async (req, res) => {
    try {
        const sanctions = await client_1.prisma.sanction.findMany({
            where: { status: req.params.status },
            include: {
                church: true
            }
        });
        res.json(sanctions);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to fetch sanctions by status' });
    }
});
exports.default = router;
