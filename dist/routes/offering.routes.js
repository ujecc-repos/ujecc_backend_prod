"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("../utils/client");
const moment_1 = __importDefault(require("moment"));
const router = (0, express_1.Router)();
// Create offering
router.post("/", async (req, res) => {
    try {
        const { amount, date, paymentMethod, note, currency, churchId, status } = req.body;
        const convert1 = (0, moment_1.default)(`${date}`, 'YYYY-MM-DD', true);
        const offering = await client_1.prisma.offering.create({
            data: {
                amount,
                currency: currency || "HTG",
                date: convert1.toDate(),
                status: status || "offrande",
                paymentMethod,
                note,
                church: {
                    connect: {
                        id: churchId
                    }
                }
            },
        });
        res.json(offering);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create offering record" });
    }
});
// Get all offerings
router.get("/", async (req, res) => {
    try {
        const offerings = await client_1.prisma.offering.findMany();
        res.json(offerings);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch offerings" });
    }
});
// Get offerings by church ID with pagination, search, and filtering
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
        // Add search filter (search in note since offering doesn't have contributorName)
        if (search) {
            whereClause.note = {
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
        const totalCount = await client_1.prisma.offering.count({ where: whereClause });
        // Get paginated offerings
        const offerings = await client_1.prisma.offering.findMany({
            where: whereClause,
            orderBy: orderBy,
            skip: skip,
            take: limitNum
        });
        // Calculate total amount
        const totalAmount = offerings.reduce((sum, offering) => sum + offering.amount, 0);
        // Calculate pagination metadata
        const totalPages = Math.ceil(totalCount / limitNum);
        const hasNextPage = pageNum < totalPages;
        const hasPreviousPage = pageNum > 1;
        res.json({
            offerings,
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
        console.error("Error fetching offerings by church:", error);
        res.status(500).json({ error: "Failed to fetch offerings by church" });
    }
});
// Get offering by ID
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const offering = await client_1.prisma.offering.findUnique({
            where: { id },
        });
        if (!offering) {
            return res.status(404).json({ error: "Offering record not found" });
        }
        res.json(offering);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch offering record" });
    }
});
// Update offering
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { amount, date, paymentMethod, note } = req.body;
        const offering = await client_1.prisma.offering.update({
            where: { id },
            data: {
                amount,
                date: new Date(date),
                paymentMethod,
                note,
            },
        });
        res.json(offering);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update offering record" });
    }
});
// Delete offering
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await client_1.prisma.offering.delete({
            where: { id },
        });
        res.json({ message: "Offering record deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to delete offering record" });
    }
});
exports.default = router;
