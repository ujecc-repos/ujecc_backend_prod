"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("../utils/client");
const router = (0, express_1.Router)();
// Create committee
router.post("/", async (req, res) => {
    try {
        const { comiteeName, description, meetingDay, meetingTime, leaderIds, memberIds, churchId } = req.body;
        console.log('Creating committee with data:', req.body);
        console.log('Church ID for new committee:', churchId);
        const comitee = await client_1.prisma.comitee.create({
            data: {
                name: comiteeName,
                description,
                meetingDay,
                meetingTime,
                church: {
                    connect: {
                        id: churchId,
                    }
                },
                commiteeLeader: {
                    connect: leaderIds && leaderIds.length > 0 ? leaderIds.map((id) => ({ id })) : [],
                },
                commiteeMember: {
                    connect: memberIds && memberIds.length > 0 ? memberIds.map((id) => ({ id })) : [],
                },
            },
            include: {
                commiteeLeader: true,
                commiteeMember: true,
            },
        });
        // Transform the data to match the frontend expectations
        const transformedComitee = {
            ...comitee,
            comiteeName: comitee.name // Add comiteeName field to match frontend expectations
        };
        res.json(transformedComitee);
    }
    catch (error) {
        console.error('Create committee error:', error);
        let errorMessage = 'Failed to create committee';
        let errorDetails = {};
        if (error && typeof error === 'object') {
            if ('message' in error) {
                errorDetails = { details: error.message };
            }
        }
        res.status(500).json({
            error: error && typeof error === 'object' ? error : { message: 'Unknown error' },
            message: errorMessage,
            ...errorDetails
        });
    }
});
// Get all committees
router.get("/", async (req, res) => {
    try {
        const comitees = await client_1.prisma.comitee.findMany({
            include: {
                commiteeLeader: true,
                commiteeMember: true,
            },
        });
        res.json(comitees);
    }
    catch (error) {
        console.error('Fetch committees error:', error);
        res.status(500).json({ error: "Failed to fetch committees" });
    }
});
// Get committees by church
router.get("/church/:churchId", async (req, res) => {
    try {
        const { churchId } = req.params;
        console.log('Fetching committees for church ID:', churchId);
        const comitees = await client_1.prisma.comitee.findMany({
            where: { churchId },
            include: {
                commiteeLeader: true,
                commiteeMember: true,
            },
        });
        console.log('Found committees:', comitees.length);
        // Transform the data to match the frontend expectations
        const transformedComitees = comitees.map(comitee => ({
            ...comitee,
            comiteeName: comitee.name // Add comiteeName field to match frontend expectations
        }));
        res.json(transformedComitees);
    }
    catch (error) {
        console.log("error : ", error);
        // Extraire les informations pertinentes de l'erreur
        const errorInfo = {
            message: 'Unknown error',
        };
        // Vérifier si l'erreur est un objet avec des propriétés
        if (error && typeof error === 'object') {
            if ('name' in error)
                errorInfo.name = error.name;
            if ('message' in error)
                errorInfo.message = error.message;
            if ('clientVersion' in error)
                errorInfo.clientVersion = error.clientVersion;
            if ('meta' in error)
                errorInfo.meta = error.meta;
        }
        console.error('Detailed error information:', errorInfo);
        // Vérifier si c'est une erreur de validation Prisma
        if (error && typeof error === 'object' && 'name' in error && error.name === 'PrismaClientValidationError') {
            return res.status(400).json({
                error: {
                    name: error.name,
                    message: 'Validation error in search query. Please try a different search term.',
                    clientVersion: 'clientVersion' in error ? error.clientVersion : undefined,
                    details: 'message' in error ? error.message : 'Unknown validation error'
                }
            });
        }
        res.status(500).json({
            error: errorInfo
        });
    }
});
// Get committee by ID
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const comitee = await client_1.prisma.comitee.findUnique({
            where: { id },
            include: {
                commiteeLeader: true,
                commiteeMember: true,
            },
        });
        if (!comitee) {
            return res.status(404).json({ error: "Committee not found" });
        }
        // Transform the data to match the frontend expectations
        const transformedComitee = {
            ...comitee,
            comiteeName: comitee.name // Add comiteeName field to match frontend expectations
        };
        res.json(transformedComitee);
    }
    catch (error) {
        console.error('Fetch committee error:', error);
        res.status(500).json({ error: "Failed to fetch committee" });
    }
});
// Update committee
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, meetingDay, meetingTime, leaderIds, memberIds } = req.body;
        const comitee = await client_1.prisma.comitee.update({
            where: { id },
            data: {
                name,
                description,
                meetingDay,
                meetingTime,
                commiteeLeader: {
                    set: leaderIds.map((id) => ({ id })),
                },
                commiteeMember: {
                    set: memberIds.map((id) => ({ id })),
                },
            },
            include: {
                commiteeLeader: true,
                commiteeMember: true,
            },
        });
        res.json(comitee);
    }
    catch (error) {
        console.error('Update committee error:', error);
        res.status(500).json({ error: "Failed to update committee" });
    }
});
// Delete committee
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await client_1.prisma.comitee.delete({
            where: { id },
        });
        res.json({ message: "Committee deleted successfully" });
    }
    catch (error) {
        console.error('Delete committee error:', error);
        res.status(500).json({ error: "Failed to delete committee" });
    }
});
exports.default = router;
