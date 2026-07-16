"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("../utils/client");
const moment_1 = __importDefault(require("moment"));
const router = (0, express_1.Router)();
// Create moisson record
router.post("/", async (req, res) => {
    try {
        const { contributorName, amount, date, paymentMethod, note, currency, churchId, status } = req.body;
        const convert1 = (0, moment_1.default)(`${date}`, 'YYYY-MM-DD', true);
        const moisson = await client_1.prisma.moisson.create({
            data: {
                contributorName,
                amount,
                currency: currency || "HTG",
                date: convert1.toDate(),
                // status: status || "pending",
                paymentMethod,
                note,
                church: churchId ? {
                    connect: {
                        id: churchId,
                    }
                } : undefined
            },
        });
        res.json(moisson);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create moisson record" });
    }
});
// Get all moisson records
router.get("/", async (req, res) => {
    try {
        const moissons = await client_1.prisma.moisson.findMany();
        res.json(moissons);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch moisson records" });
    }
});
// Get moisson by ID
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const moisson = await client_1.prisma.moisson.findUnique({
            where: { id },
        });
        if (!moisson) {
            return res.status(404).json({ error: "Moisson record not found" });
        }
        res.json(moisson);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch moisson record" });
    }
});
// Get moissons by church ID with pagination, search, and filtering
router.get("/church/:churchId", async (req, res) => {
    try {
        const { churchId } = req.params;
        const { startDate, endDate, page = '1', limit = '10', search = '', status = '', minAmount = '', maxAmount = '', sortBy = 'date', sortOrder = 'desc' } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        // Build where clause
        const whereClause = {
            churchId: churchId
        };
        // Add date filter if provided
        if (startDate && endDate) {
            whereClause.date = {
                gte: new Date(startDate),
                lte: new Date(endDate)
            };
        }
        // Add search filter for contributorName
        if (search) {
            whereClause.contributorName = {
                contains: search,
                mode: 'insensitive'
            };
        }
        // Add status filter
        if (status) {
            whereClause.status = status;
        }
        // Add amount range filter
        if (minAmount || maxAmount) {
            whereClause.amount = {};
            if (minAmount) {
                whereClause.amount.gte = parseFloat(minAmount);
            }
            if (maxAmount) {
                whereClause.amount.lte = parseFloat(maxAmount);
            }
        }
        // Build orderBy clause
        const orderBy = {};
        orderBy[sortBy] = sortOrder;
        // Get total count for pagination
        const totalCount = await client_1.prisma.moisson.count({ where: whereClause });
        // Get paginated moissons
        const moissons = await client_1.prisma.moisson.findMany({
            where: whereClause,
            orderBy: orderBy,
            skip: skip,
            take: limitNum
        });
        // Calculate total amount
        const totalAmount = moissons.reduce((sum, moisson) => sum + moisson.amount, 0);
        // Calculate pagination metadata
        const totalPages = Math.ceil(totalCount / limitNum);
        const hasNextPage = pageNum < totalPages;
        const hasPreviousPage = pageNum > 1;
        res.json({
            moissons,
            totalAmount,
            pagination: {
                currentPage: pageNum,
                totalPages,
                totalCount,
                limit: limitNum,
                hasNextPage,
                hasPreviousPage
            },
            period: startDate && endDate ? `${startDate} to ${endDate}` : 'all'
        });
    }
    catch (error) {
        console.error("Error fetching moissons by church:", error);
        res.status(500).json({ error: "Failed to fetch moissons by church" });
    }
});
// Update moisson record
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { contributorName, amount, date, paymentMethod, note, status, churchId } = req.body;
        const moisson = await client_1.prisma.moisson.update({
            where: { id },
            data: {
                contributorName,
                amount,
                date: new Date(date),
                paymentMethod,
                note,
                // status,
                church: churchId ? {
                    connect: {
                        id: churchId,
                    }
                } : undefined
            },
        });
        res.json(moisson);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update moisson record" });
    }
});
// Delete moisson record
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await client_1.prisma.moisson.delete({
            where: { id },
        });
        res.json({ message: "Moisson record deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to delete moisson record" });
    }
});
exports.default = router;
