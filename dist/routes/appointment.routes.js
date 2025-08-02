"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../generated/prisma");
const moment_1 = __importDefault(require("moment"));
const router = (0, express_1.Router)();
const prisma = new prisma_1.PrismaClient();
// Create a new appointment
router.post("/", async (req, res) => {
    try {
        const { name, description, date, time, duration, notes, userIds, churchId } = req.body;
        // if (!userIds || userIds.length === 0) {
        //   return res.status(400).json({ error: "At least one user must be assigned" });
        // }
        // if (userIds.length > 3) {
        //   return res.status(400).json({ error: "Maximum of three users can be assigned" });
        // }
        const convert1 = (0, moment_1.default)(`${date}`, 'YYYY-MM-DD', true);
        const appointment = await prisma.appointment.create({
            data: {
                name,
                description,
                date: convert1.toDate(),
                time,
                duration,
                notes,
                assignedUsers: {
                    connect: userIds.map((id) => ({ id }))
                },
                church: churchId ? {
                    connect: { id: churchId }
                } : undefined
            },
            include: {
                assignedUsers: true
            }
        });
        res.status(201).json(appointment);
    }
    catch (error) {
        res.status(500).json({ error: error });
    }
});
// Get all appointments
router.get("/", async (req, res) => {
    try {
        const appointments = await prisma.appointment.findMany({
            include: {
                assignedUsers: true
            }
        });
        res.json(appointments);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch appointments" });
    }
});
// Get appointments by church ID
router.get("/church/:churchId", async (req, res) => {
    try {
        const { churchId } = req.params;
        const appointments = await prisma.appointment.findMany({
            where: { churchId },
            include: {
                assignedUsers: true
            }
        });
        res.json(appointments);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch appointments by church" });
    }
});
// Get appointment by ID
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const appointment = await prisma.appointment.findUnique({
            where: { id },
            include: {
                assignedUsers: true
            }
        });
        if (!appointment) {
            return res.status(404).json({ error: "Appointment not found" });
        }
        res.json(appointment);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch appointment" });
    }
});
// Update appointment
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { name, visibility, description, date, time, duration, notes, userIds, churchId } = req.body;
        const appointment = await prisma.appointment.update({
            where: { id },
            data: {
                name,
                visibility,
                description,
                date: new Date(date),
                time,
                duration,
                notes,
                assignedUsers: {
                    set: userIds.map((id) => ({ id }))
                },
                church: churchId ? {
                    connect: { id: churchId }
                } : undefined
            },
            include: {
                assignedUsers: true
            }
        });
        res.json(appointment);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update appointment" });
    }
});
// Delete appointment
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.appointment.delete({
            where: { id }
        });
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({ error: "Failed to delete appointment" });
    }
});
exports.default = router;
