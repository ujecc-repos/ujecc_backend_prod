"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("../utils/client");
const moment_1 = __importDefault(require("moment"));
const lodash_1 = __importDefault(require("lodash"));
const router = express_1.default.Router();
// Create a new death record
router.post('/', async (req, res) => {
    const allDate = lodash_1.default.pick(req.body, ["deathDate", "serviceDate"]);
    const rest = lodash_1.default.omit(req.body, ["deathDate", "serviceDate", "churchId"]);
    const convert1 = (0, moment_1.default)(`${allDate.deathDate}`, 'YYYY-MM-DD', true);
    const convert2 = (0, moment_1.default)(`${allDate.serviceDate}`, 'YYYY-MM-DD', true);
    try {
        const death = await client_1.prisma.death.create({
            data: {
                ...rest,
                deathDate: convert1.toDate(),
                serviceDate: convert2.toDate()
            }
        });
        res.json(death);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to create death record' });
    }
});
// Get all death records
router.get('/', async (req, res) => {
    try {
        const deaths = await client_1.prisma.death.findMany({
            include: {
                church: true
            }
        });
        res.json(deaths);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to fetch death records' });
    }
});
// Get a single death record by ID
router.get('/:id', async (req, res) => {
    try {
        const death = await client_1.prisma.death.findUnique({
            where: { id: req.params.id },
            include: {
                church: true
            }
        });
        if (!death) {
            return res.status(404).json({ error: 'Death record not found' });
        }
        res.json(death);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to fetch death record' });
    }
});
// Update a death record
router.put('/:id', async (req, res) => {
    try {
        const death = await client_1.prisma.death.update({
            where: { id: req.params.id },
            data: req.body
        });
        res.json(death);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to update death record' });
    }
});
// Delete a death record
router.delete('/:id', async (req, res) => {
    try {
        await client_1.prisma.death.delete({
            where: { id: req.params.id }
        });
        res.json({ message: 'Death record deleted successfully' });
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to delete death record' });
    }
});
// Get death records by church ID
router.get('/church/:churchId', async (req, res) => {
    try {
        const deaths = await client_1.prisma.death.findMany({
            where: { churchId: req.params.churchId },
            include: {
                church: true
            }
        });
        res.json(deaths);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to fetch church death records' });
    }
});
// Get deaths by date range
router.get('/date-range', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const deaths = await client_1.prisma.death.findMany({
            where: {
                deathDate: {
                    gte: new Date(startDate),
                    lte: new Date(endDate)
                }
            },
            include: {
                church: true
            }
        });
        res.json(deaths);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to fetch deaths by date range' });
    }
});
exports.default = router;
