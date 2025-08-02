"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../generated/prisma");
const moment_1 = __importDefault(require("moment"));
const upload_1 = __importDefault(require("../utils/upload"));
const path_1 = __importDefault(require("path"));
const router = (0, express_1.Router)();
const prisma = new prisma_1.PrismaClient();
// Create a new marriage record
router.post('/', upload_1.default.fields([
    { name: 'grooomCertificate', maxCount: 1 },
    { name: 'brideCertificate', maxCount: 1 },
    { name: 'weddingCertificate', maxCount: 1 }
]), async (req, res) => {
    try {
        const { brideFullname, birthDate, groomFullname, goomBirthDate, weddingDate, weddingLocation, officiantName, civilStateOfficer, witnessSignature, churchId } = req.body;
        console.log("vody ", req.body);
        // Handle file uploads
        const files = req.files;
        // Get file paths if they exist
        const grooomCertificatePath = files?.grooomCertificate ?
            `/uploads/${path_1.default.basename(files.grooomCertificate[0].path)}` : null;
        const brideCertificatePath = files?.brideCertificate ?
            `/uploads/${path_1.default.basename(files.brideCertificate[0].path)}` : null;
        const weddingCertificatePath = files?.weddingCertificate ?
            `/uploads/${path_1.default.basename(files.weddingCertificate[0].path)}` : null;
        const convert1 = (0, moment_1.default)(`${birthDate}`, 'YYYY-MM-DD', true);
        const convert2 = (0, moment_1.default)(`${goomBirthDate}`, 'YYYY-MM-DD', true);
        const convert3 = (0, moment_1.default)(`${weddingDate}`, 'YYYY-MM-DD', true);
        const mariage = await prisma.mariage.create({
            data: {
                brideFullname,
                birthDate: convert1.toDate(),
                groomFullname,
                goomBirthDate: convert2.toDate(),
                weddingDate: convert3.toDate(),
                weddingLocation,
                grooomCertificate: grooomCertificatePath,
                brideCertificate: brideCertificatePath,
                weddingCertificate: weddingCertificatePath || "",
                officiantName,
                civilStateOfficer,
                witnessSignature,
                church: {
                    connect: {
                        id: churchId
                    }
                }
            }
        });
        res.status(201).json(mariage);
    }
    catch (error) {
        console.error('Error creating marriage record:', error);
        res.status(400).json({ error: `${error}` });
    }
});
// Get all marriage records
router.get('/', async (req, res) => {
    try {
        const mariages = await prisma.mariage.findMany({
            include: {
                church: true
            }
        });
        res.json(mariages);
    }
    catch (error) {
        res.status(500).json({ error: error });
    }
});
// Get a specific marriage record
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const mariage = await prisma.mariage.findUnique({
            where: { id },
            include: {
                church: true
            }
        });
        if (!mariage) {
            return res.status(404).json({ error: 'Marriage record not found' });
        }
        res.json(mariage);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch marriage record' });
    }
});
//get mairiage by churchId
router.get('/mariage/church/:churchId', async (req, res) => {
    try {
        const mariage = await prisma.mariage.findMany({
            where: { churchId: req.params.churchId },
            include: {
                church: true
            }
        });
        if (!mariage) {
            return res.status(404).json({ error: 'Marriage record not found' });
        }
        res.json(mariage);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch marriage record' });
    }
});
// Update a marriage record
router.put('/:id', upload_1.default.fields([
    { name: 'grooomCertificate', maxCount: 1 },
    { name: 'brideCertificate', maxCount: 1 },
    { name: 'weddingCertificate', maxCount: 1 }
]), async (req, res) => {
    try {
        const { id } = req.params;
        const { brideFullname, birthDate, groomFullname, goomBirthDate, weddingDate, weddingLocation, officiantName, civilStateOfficer, witnessSignature, churchId } = req.body;
        // Handle file uploads
        const files = req.files;
        // Get existing marriage record to preserve existing file paths if no new files uploaded
        const existingMarriage = await prisma.mariage.findUnique({ where: { id } });
        if (!existingMarriage) {
            return res.status(404).json({ error: 'Marriage record not found' });
        }
        // Get file paths if they exist or keep existing ones
        const grooomCertificatePath = files?.grooomCertificate ?
            `/uploads/${path_1.default.basename(files.grooomCertificate[0].path)}` : existingMarriage.grooomCertificate;
        const brideCertificatePath = files?.brideCertificate ?
            `/uploads/${path_1.default.basename(files.brideCertificate[0].path)}` : existingMarriage.brideCertificate;
        const weddingCertificatePath = files?.weddingCertificate ?
            `/uploads/${path_1.default.basename(files.weddingCertificate[0].path)}` : existingMarriage.weddingCertificate;
        // Build update data object with only provided fields
        const updateData = {};
        if (brideFullname !== undefined)
            updateData.brideFullname = brideFullname;
        if (birthDate !== undefined)
            updateData.birthDate = new Date(birthDate);
        if (groomFullname !== undefined)
            updateData.groomFullname = groomFullname;
        if (goomBirthDate !== undefined)
            updateData.goomBirthDate = new Date(goomBirthDate);
        if (weddingDate !== undefined)
            updateData.weddingDate = new Date(weddingDate);
        if (weddingLocation !== undefined)
            updateData.weddingLocation = weddingLocation;
        if (officiantName !== undefined)
            updateData.officiantName = officiantName;
        if (civilStateOfficer !== undefined)
            updateData.civilStateOfficer = civilStateOfficer;
        if (witnessSignature !== undefined)
            updateData.witnessSignature = witnessSignature;
        if (churchId !== undefined)
            updateData.churchId = churchId;
        // Always update certificate paths (they will be existing paths if no new files)
        updateData.grooomCertificate = grooomCertificatePath;
        updateData.brideCertificate = brideCertificatePath;
        updateData.weddingCertificate = weddingCertificatePath;
        const updatedMariage = await prisma.mariage.update({
            where: { id },
            data: updateData
        });
        res.json(updatedMariage);
    }
    catch (error) {
        console.error('Error updating marriage record:', error);
        res.status(400).json({ error: 'Failed to update marriage record' });
    }
});
// Delete a marriage record
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.mariage.delete({
            where: { id }
        });
        res.status(204).send();
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to delete marriage record' });
    }
});
exports.default = router;
