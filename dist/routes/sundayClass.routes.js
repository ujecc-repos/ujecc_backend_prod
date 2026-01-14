"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../generated/prisma");
const router = (0, express_1.Router)();
const prisma = new prisma_1.PrismaClient();
// Create a new Sunday Class
router.post("/", async (req, res) => {
    try {
        const { nom, teacher, ageGroup, startTime, endTime, maxStudents, description, churchId } = req.body;
        // Ensure proper data types
        const parsedData = {
            nom: String(nom),
            teacher: String(teacher),
            ageGroup: String(ageGroup),
            startTime: startTime, // Convert to Date object
            endTime: endTime, // Convert to Date object
            maxStudents: maxStudents, // Ensure it's a number
            description: String(description),
            church: {
                connect: { id: churchId }
            }
        };
        const sundayClass = await prisma.sundayClass.create({
            data: parsedData
        });
        res.status(201).json(sundayClass);
    }
    catch (error) {
        console.log("Error creating Sunday Class:", error);
        // Provide more detailed error information
        let errorMessage = "Failed to create Sunday Class";
        let errorDetails = {};
        // Type guard to check if error is an object with name and message properties
        if (error && typeof error === 'object' && 'name' in error) {
            const typedError = error;
            if (typedError.name === "PrismaClientValidationError") {
                errorMessage = "Validation error: Please check that all required fields have valid values";
                errorDetails = {
                    name: typedError.name,
                    message: typedError.message || 'Unknown validation error'
                };
            }
        }
        res.status(400).json({
            error: errorMessage,
            details: errorDetails
        });
    }
});
// Get all Sunday Classes
router.get("/", async (req, res) => {
    try {
        const sundayClasses = await prisma.sundayClass.findMany({
            include: {
                church: true
            }
        });
        res.json(sundayClasses);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch Sunday Classes" });
    }
});
// Get Sunday Classes by church (without pagination)
router.get("/church/:churchId", async (req, res) => {
    try {
        const { churchId } = req.params;
        const sundayClasses = await prisma.sundayClass.findMany({
            where: {
                churchId
            },
            include: {
                church: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        res.json(sundayClasses);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch Sunday Classes" });
    }
});
// Get a specific Sunday Class by ID
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const sundayClass = await prisma.sundayClass.findUnique({
            where: { id },
            include: {
                church: true
            }
        });
        if (!sundayClass) {
            return res.status(404).json({ error: "Sunday Class not found" });
        }
        res.json(sundayClass);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch Sunday Class" });
    }
});
// Update a Sunday Class
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { nom, teacher, ageGroup, startTime, endTime, maxStudents, description, churchId } = req.body;
        const updatedSundayClass = await prisma.sundayClass.update({
            where: { id },
            data: {
                nom,
                teacher,
                ageGroup,
                startTime: startTime,
                endTime: endTime,
                maxStudents,
                description,
                churchId
            }
        });
        res.json(updatedSundayClass);
    }
    catch (error) {
        res.status(400).json({ error: "Failed to update Sunday Class" });
    }
});
// Delete a Sunday Class
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.sundayClass.delete({
            where: { id }
        });
        res.status(204).send();
    }
    catch (error) {
        res.status(400).json({ error: "Failed to delete Sunday Class" });
    }
});
exports.default = router;
