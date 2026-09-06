"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("../utils/client");
const lodash_1 = __importDefault(require("lodash"));
const upload_1 = __importDefault(require("../utils/upload"));
const router = express_1.default.Router();
const meetingDayAliases = {
    lundi: 'Lendi', lendi: 'Lendi',
    mardi: 'Madi', madi: 'Madi',
    mercredi: 'Mèkredi', mekredi: 'Mèkredi', mèkredi: 'Mèkredi',
    jeudi: 'Jedi', jedi: 'Jedi',
    vendredi: 'Vandredi', vandredi: 'Vandredi',
    samedi: 'Samdi', samdi: 'Samdi',
    dimanche: 'Dimanch', dimanch: 'Dimanch',
};
const normalizeMeetingDays = (value) => {
    const values = Array.isArray(value) ? value : String(value || '').split(',');
    const normalized = values
        .map((day) => String(day).trim().replace(/^Chaque\s+/i, '').toLocaleLowerCase('fr'))
        .map((day) => meetingDayAliases[day])
        .filter((day) => Boolean(day));
    return Array.from(new Set(normalized)).join(', ');
};
router.post('/', upload_1.default.single('groupImage'), async (req, res) => {
    // Extract data from request body
    const userData = req.body;
    const { name, minister, description, meetingDay, meetingDays, meetingTime, churchId, meetingLocation, meetingFrequency, ageGroup, maxMembers } = userData;
    try {
        // If a file was uploaded, add the file path to the group data
        if (req.file) {
            userData.picture = `/uploads/${req.file.filename}`;
        }
        const group = await client_1.prisma.groupe.create({
            data: {
                name,
                minister: minister || "",
                description: description || "",
                meetingDays: normalizeMeetingDays(meetingDays ?? meetingDay),
                meetingTime: meetingTime || "",
                meetingLocation: meetingLocation || "",
                meetingFrequency: meetingFrequency || "",
                ageGroup: ageGroup || "",
                maxMembers: maxMembers || "",
                picture: userData.picture, // Add the picture field
                church: { connect: { id: churchId } }
            }
        });
        res.json(group);
    }
    catch (error) {
        res.status(400).json({ error: error });
    }
});
// Get all groups
router.get('/', async (req, res) => {
    try {
        const groups = await client_1.prisma.groupe.findMany({
            include: {
                church: true,
                users: { where: { membreActif: true } }
            }
        });
        res.json(groups);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to fetch groups' });
    }
});
// Get a single group by ID
router.get('/:id', async (req, res) => {
    try {
        const group = await client_1.prisma.groupe.findUnique({
            where: { id: req.params.id },
            include: {
                church: true,
                users: { where: { membreActif: true } }
            }
        });
        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }
        res.json(group);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to fetch group' });
    }
});
// Update a group with optional image upload
router.put('/:id', upload_1.default.single('groupImage'), async (req, res) => {
    try {
        // Extract data from request body
        const groupData = req.body;
        // If a file was uploaded, add the file path to the group data
        if (req.file) {
            groupData.picture = `/uploads/${req.file.filename}`;
        }
        const meetingDaysInput = groupData.meetingDays ?? groupData.meetingDay;
        const updateData = {
            ...lodash_1.default.omit(groupData, ["id", "meetingDay", "meetingDays"]),
            picture: req.file ? `/uploads/${req.file.filename}` : undefined
        };
        if (meetingDaysInput !== undefined) {
            updateData.meetingDays = normalizeMeetingDays(meetingDaysInput);
        }
        const group = await client_1.prisma.groupe.update({
            where: { id: req.params.id },
            data: updateData
        });
        res.json(group);
    }
    catch (error) {
        res.status(400).json({ error: error });
    }
});
// Delete a group
router.delete('/:id', async (req, res) => {
    try {
        await client_1.prisma.groupe.delete({
            where: { id: req.params.id }
        });
        res.json({ message: 'Group deleted successfully' });
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to delete group' });
    }
});
// Get groups by church ID
router.get('/church/:churchId', async (req, res) => {
    try {
        const groups = await client_1.prisma.groupe.findMany({
            where: { churchId: req.params.churchId },
            include: {
                church: true,
                users: { where: { membreActif: true } }
            }
        });
        res.json(groups);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to fetch church groups' });
    }
});
// Add user to group
router.post('/:id/users', async (req, res) => {
    try {
        // Check if we're adding a single user or multiple users
        if (req.body.userId) {
            // Single user case
            const group = await client_1.prisma.groupe.update({
                where: { id: req.params.id },
                data: {
                    users: {
                        connect: { id: req.body.userId }
                    }
                },
                include: {
                    users: { where: { membreActif: true } }
                }
            });
            res.json(group);
        }
        else if (req.body.users && Array.isArray(req.body.users)) {
            // Multiple users case
            const userConnections = req.body.users.map((userId) => ({ id: userId }));
            const group = await client_1.prisma.groupe.update({
                where: { id: req.params.id },
                data: {
                    users: {
                        connect: userConnections
                    }
                },
                include: {
                    users: { where: { membreActif: true } }
                }
            });
            res.json(group);
        }
        else {
            res.status(400).json({ error: 'Invalid request. Provide userId or users array.' });
        }
    }
    catch (error) {
        console.error('Error adding user(s) to group:', error);
        res.status(400).json({ error: 'Failed to add user(s) to group' });
    }
});
// Remove user from group
router.delete('/:id/users/:userId', async (req, res) => {
    try {
        const group = await client_1.prisma.groupe.update({
            where: { id: req.params.id },
            data: {
                users: {
                    disconnect: { id: req.params.userId }
                }
            }
        });
        res.json(group);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to remove user from group' });
    }
});
// Transfer user from one group to another
router.post('/:sourceGroupId/transfer/:userId', async (req, res) => {
    try {
        const { sourceGroupId, userId } = req.params;
        const { targetGroupId } = req.body;
        if (!targetGroupId) {
            return res.status(400).json({ error: 'Target group ID is required' });
        }
        // Start a transaction to ensure both operations succeed or fail together
        const result = await client_1.prisma.$transaction(async (prisma) => {
            // Remove user from source group
            await prisma.groupe.update({
                where: { id: sourceGroupId },
                data: {
                    users: {
                        disconnect: { id: userId }
                    }
                }
            });
            // Add user to target group
            const updatedTargetGroup = await prisma.groupe.update({
                where: { id: targetGroupId },
                data: {
                    users: {
                        connect: { id: userId }
                    }
                },
                include: {
                    users: { where: { membreActif: true } }
                }
            });
            return updatedTargetGroup;
        });
        res.json({
            message: 'User transferred successfully',
            targetGroup: result
        });
    }
    catch (error) {
        console.error('Error transferring user:', error);
        res.status(400).json({ error: 'Failed to transfer user between groups' });
    }
});
exports.default = router;
