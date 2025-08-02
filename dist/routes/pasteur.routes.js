"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../generated/prisma");
const router = (0, express_1.Router)();
const prisma = new prisma_1.PrismaClient();
// Create a pasteur
router.post('/', async (req, res) => {
    console.log(req.body);
    try {
        const { pasteurName, phone, address, status, email, churchId } = req.body;
        const newPasteur = await prisma.pasteur.create({
            data: {
                pasteurName,
                phone,
                address,
                email,
                status,
                church: {
                    connect: {
                        id: churchId
                    }
                }
            },
        });
        res.status(201).json(newPasteur);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la création du pasteur.' });
    }
});
// Get all pasteurs
router.get('/', async (req, res) => {
    try {
        const pasteurs = await prisma.pasteur.findMany({
            include: {
                church: true, // include church information
            },
        });
        res.status(200).json(pasteurs);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors du chargement des pasteurs.' });
    }
});
// Get pasteur by ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const pasteur = await prisma.pasteur.findUnique({
            where: { id },
            include: { church: true },
        });
        if (!pasteur) {
            return res.status(404).json({ error: 'Pasteur non trouvé.' });
        }
        res.status(200).json(pasteur);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur serveur.' });
    }
});
// Update a pasteur
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { pasteurName, phone, address, email, status, } = req.body;
    try {
        const updatedPasteur = await prisma.pasteur.update({
            where: { id },
            data: {
                pasteurName,
                phone,
                address,
                email,
                status,
            },
        });
        res.status(200).json(updatedPasteur);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la mise à jour du pasteur.' });
    }
});
// Delete a pasteur
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.pasteur.delete({ where: { id } });
        res.status(200).json({ message: 'Pasteur supprimé avec succès.' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la suppression.' });
    }
});
// Get pasteurs by churchId
router.get('/church/:churchId', async (req, res) => {
    const { churchId } = req.params;
    try {
        const pasteurs = await prisma.pasteur.findMany({
            where: {
                church: {
                    id: churchId
                }
            },
            include: { church: true },
        });
        if (pasteurs.length === 0) {
            return res.status(200).json([]);
        }
        res.status(200).json(pasteurs);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors du chargement des pasteurs pour cette église.' });
    }
});
exports.default = router;
