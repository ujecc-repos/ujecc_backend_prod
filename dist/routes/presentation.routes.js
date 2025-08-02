"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("../utils/client");
const moment_1 = __importDefault(require("moment"));
const upload_1 = __importDefault(require("../utils/upload"));
const path_1 = __importDefault(require("path"));
const router = express_1.default.Router();
// Create a new presentation record
router.post('/', upload_1.default.fields([
    { name: 'birthCertificate', maxCount: 1 }
]), async (req, res) => {
    try {
        const { childName, presentationDate, dateOfBirth, placeOfBirth, fatherName, motherName, officiantName, address, phone, witness, description, churchId } = req.body;
        // Handle file uploads
        const files = req.files;
        // Get file path if it exists
        const birthCertificatePath = files?.birthCertificate ?
            `/uploads/${path_1.default.basename(files.birthCertificate[0].path)}` : null;
        const convert1 = (0, moment_1.default)(`${presentationDate}`, 'YYYY-MM-DD', true);
        const convert2 = (0, moment_1.default)(`${dateOfBirth}`, 'YYYY-MM-DD', true);
        const presentation = await client_1.prisma.presentation.create({
            data: {
                childName,
                presentationDate: convert1.toDate(),
                dateOfBirth: convert2.toDate(),
                placeOfBirth,
                fatherName,
                motherName,
                officiantName,
                address,
                phone,
                witness,
                description,
                birthCertificate: birthCertificatePath,
                church: churchId ? {
                    connect: {
                        id: churchId
                    }
                } : undefined
            }
        });
        res.status(201).json(presentation);
    }
    catch (error) {
        console.error('Error creating presentation record:', error);
        res.status(400).json({ error: 'Failed to create presentation record' });
    }
});
// Get all presentation records
router.get('/', async (req, res) => {
    try {
        const presentations = await client_1.prisma.presentation.findMany({
            include: {
                church: true
            }
        });
        res.json(presentations);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to fetch presentation records' });
    }
});
// Get a single presentation record by ID
router.get('/:id', async (req, res) => {
    try {
        const presentation = await client_1.prisma.presentation.findUnique({
            where: { id: req.params.id },
            include: {
                church: true
            }
        });
        if (!presentation) {
            return res.status(404).json({ error: 'Presentation record not found' });
        }
        res.json(presentation);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to fetch presentation record' });
    }
});
// Update a presentation record
router.put('/:id', async (req, res) => {
    try {
        const presentation = await client_1.prisma.presentation.update({
            where: { id: req.params.id },
            data: req.body
        });
        res.json(presentation);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to update presentation record' });
    }
});
// Delete a presentation record
router.delete('/:id', async (req, res) => {
    try {
        await client_1.prisma.presentation.delete({
            where: { id: req.params.id }
        });
        res.json({ message: 'Presentation record deleted successfully' });
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to delete presentation record' });
    }
});
// Get presentation records by church ID
router.get('/church/:churchId', async (req, res) => {
    try {
        const presentations = await client_1.prisma.presentation.findMany({
            where: { churchId: req.params.churchId },
            include: {
                church: true
            }
        });
        res.json(presentations);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to fetch church presentation records' });
    }
});
// Get presentations by date range
router.get('/date-range', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const presentations = await client_1.prisma.presentation.findMany({
            where: {
                presentationDate: {
                    gte: new Date(startDate),
                    lte: new Date(endDate)
                }
            },
            include: {
                church: true
            }
        });
        res.json(presentations);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to fetch presentations by date range' });
    }
});
exports.default = router;
