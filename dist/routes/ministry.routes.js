"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("../utils/client");
const router = express_1.default.Router();
// Create a new ministry
router.post('/', async (req, res) => {
    try {
        const ministryData = req.body;
        const ministry = await client_1.prisma.ministry.create({
            data: ministryData
        });
        res.json(ministry);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to create ministry' });
    }
});
// Get all ministries
router.get('/', async (req, res) => {
    try {
        const ministries = await client_1.prisma.ministry.findMany({
            include: {
                church: true
            }
        });
        res.json(ministries);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to fetch ministries' });
    }
});
// Get a single ministry by ID
router.get('/:id', async (req, res) => {
    try {
        const ministry = await client_1.prisma.ministry.findUnique({
            where: { id: req.params.id },
            include: {
                church: true
            }
        });
        if (!ministry) {
            return res.status(404).json({ error: 'Ministry not found' });
        }
        res.json(ministry);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to fetch ministry' });
    }
});
// Update a ministry
router.put('/:id', async (req, res) => {
    try {
        const ministry = await client_1.prisma.ministry.update({
            where: { id: req.params.id },
            data: req.body
        });
        res.json(ministry);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to update ministry' });
    }
});
// Delete a ministry
router.delete('/:id', async (req, res) => {
    try {
        await client_1.prisma.ministry.delete({
            where: { id: req.params.id }
        });
        res.json({ message: 'Ministry deleted successfully' });
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to delete ministry' });
    }
});
// Get ministries by church ID
router.get('/church/:churchId', async (req, res) => {
    try {
        const ministries = await client_1.prisma.ministry.findMany({
            where: { churchId: req.params.churchId },
            include: {
                church: true
            }
        });
        res.json(ministries);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to fetch ministries for this church' });
    }
});
exports.default = router;
