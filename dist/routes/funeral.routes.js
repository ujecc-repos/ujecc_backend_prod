"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("../utils/client");
const lodash_1 = __importDefault(require("lodash"));
const moment_1 = __importDefault(require("moment"));
const upload_1 = __importDefault(require("../utils/upload"));
const path_1 = __importDefault(require("path"));
const router = express_1.default.Router();
// Create a new funeral record
router.post('/', upload_1.default.fields([
    { name: 'deathCertificate', maxCount: 1 }
]), async (req, res) => {
    try {
        const allDate = lodash_1.default.pick(req.body, ["birthDate", "funeralDate"]);
        const rest = lodash_1.default.omit(req.body, ["birthDate", "funeralDate", "churchId"]);
        const convert1 = (0, moment_1.default)(`${allDate.birthDate}`, 'YYYY-MM-DD', true);
        const convert2 = (0, moment_1.default)(`${allDate.funeralDate}`, 'YYYY-MM-DD', true);
        // Handle file uploads
        const files = req.files;
        // Get file path if it exists
        const deathCertificatePath = files?.deathCertificate ?
            `/uploads/${path_1.default.basename(files.deathCertificate[0].path)}` : null;
        // Préparer les données pour la création
        const createData = {
            ...rest,
            birthDate: convert1.toDate(),
            funeralDate: convert2.toDate(),
            deathCertificate: deathCertificatePath
        };
        // Ajouter la relation church si churchId est fourni
        if (req.body.churchId) {
            createData.church = {
                connect: {
                    id: req.body.churchId
                }
            };
            // Supprimer churchId de l'objet rest pour éviter le conflit
            delete createData.churchId;
        }
        const funeral = await client_1.prisma.funeral.create({
            data: createData
        });
        res.json(funeral);
    }
    catch (error) {
        console.error('Error creating funeral record:', error);
        res.status(400).json({ error: 'Failed to create funeral record' });
    }
});
// Get all funeral records
router.get('/', async (req, res) => {
    try {
        const funerals = await client_1.prisma.funeral.findMany({
            include: {
                church: true
            }
        });
        res.json(funerals);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to fetch funeral records' });
    }
});
// Get a single funeral record by ID
router.get('/:id', async (req, res) => {
    try {
        const funeral = await client_1.prisma.funeral.findUnique({
            where: { id: req.params.id },
            include: {
                church: true
            }
        });
        if (!funeral) {
            return res.status(404).json({ error: 'Funeral record not found' });
        }
        res.json(funeral);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to fetch funeral record' });
    }
});
// Update a funeral record
router.put('/:id', upload_1.default.fields([
    { name: 'deathCertificate', maxCount: 1 }
]), async (req, res) => {
    try {
        // Handle dates if present
        let updateData = { ...req.body };
        if (req.body.birthDate) {
            const convertedBirthDate = (0, moment_1.default)(req.body.birthDate, 'YYYY-MM-DD', true);
            updateData.birthDate = convertedBirthDate.toDate();
        }
        if (req.body.funeralDate) {
            const convertedFuneralDate = (0, moment_1.default)(req.body.funeralDate, 'YYYY-MM-DD', true);
            updateData.funeralDate = convertedFuneralDate.toDate();
        }
        // Handle file uploads
        const files = req.files;
        // Get file path if it exists
        if (files?.deathCertificate) {
            updateData.deathCertificate = `/uploads/${path_1.default.basename(files.deathCertificate[0].path)}`;
        }
        // Handle church relationship if churchId is provided
        if (updateData.churchId) {
            updateData.church = {
                connect: {
                    id: updateData.churchId
                }
            };
            // Remove churchId to avoid conflicts
            delete updateData.churchId;
        }
        const funeral = await client_1.prisma.funeral.update({
            where: { id: req.params.id },
            data: updateData
        });
        res.json(funeral);
    }
    catch (error) {
        console.error('Error updating funeral record:', error);
        res.status(400).json({ error: 'Failed to update funeral record' });
    }
});
// Delete a funeral record
router.delete('/:id', async (req, res) => {
    try {
        await client_1.prisma.funeral.delete({
            where: { id: req.params.id }
        });
        res.json({ message: 'Funeral record deleted successfully' });
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to delete funeral record' });
    }
});
// Get funeral records by church ID
router.get('/church/:churchId', async (req, res) => {
    try {
        const funerals = await client_1.prisma.funeral.findMany({
            where: { churchId: req.params.churchId },
            include: {
                church: true
            }
        });
        res.json(funerals);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to fetch church funeral records' });
    }
});
// Get funerals by date range
router.get('/date-range', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const funerals = await client_1.prisma.funeral.findMany({
            where: {
                funeralDate: {
                    gte: new Date(startDate),
                    lte: new Date(endDate)
                }
            },
            include: {
                church: true
            }
        });
        res.json(funerals);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to fetch funerals by date range' });
    }
});
exports.default = router;
