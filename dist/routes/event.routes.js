"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("../utils/client");
const lodash_1 = __importDefault(require("lodash"));
const router = express_1.default.Router();
// Create a new event
router.post('/', async (req, res) => {
    try {
        const isRecurrin = lodash_1.default.pick(req.body, ["isRecurring"]);
        const rest = lodash_1.default.omit(req.body, ["isRecurring", "status", "frequency"]);
        const frequencyf = lodash_1.default.pick(req.body, ["frequency"]);
        const isr = Boolean(isRecurrin.isRecurring);
        const event = await client_1.prisma.event.create({
            data: { isRecurring: isr, frequency: frequencyf.frequency || "quotidient", ...rest }
        });
        res.json(event);
    }
    catch (error) {
        console.log("error : ", error);
        res.status(400).json({ error: 'Failed to create event' });
    }
});
// Get all events
router.get('/', async (req, res) => {
    try {
        const events = await client_1.prisma.event.findMany({
            include: {
                church: true
            }
        });
        res.json(events);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to fetch events' });
    }
});
// Get a single event by ID
router.get('/:id', async (req, res) => {
    try {
        const event = await client_1.prisma.event.findUnique({
            where: { id: req.params.id },
            include: {
                church: true
            }
        });
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }
        res.json(event);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to fetch event' });
    }
});
// Update an event
router.put('/:id', async (req, res) => {
    try {
        const event = await client_1.prisma.event.update({
            where: { id: req.params.id },
            data: req.body
        });
        res.json(event);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to update event' });
    }
});
// Delete an event
router.delete('/:id', async (req, res) => {
    try {
        await client_1.prisma.event.delete({
            where: { id: req.params.id }
        });
        res.json({ message: 'Event deleted successfully' });
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to delete event' });
    }
});
// Get events by church ID
router.get('/church/:churchId', async (req, res) => {
    try {
        const events = await client_1.prisma.event.findMany({
            where: { churchId: req.params.churchId },
            include: {
                church: true
            }
        });
        res.json(events);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to fetch church events' });
    }
});
// Get upcoming events
router.get('/upcoming/all', async (req, res) => {
    try {
        const events = await client_1.prisma.event.findMany({
            where: {
                createAt: {
                    gte: new Date()
                }
            },
            orderBy: {
                createAt: 'asc'
            },
            include: {
                church: true
            }
        });
        res.json(events);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to fetch upcoming events' });
    }
});
exports.default = router;
