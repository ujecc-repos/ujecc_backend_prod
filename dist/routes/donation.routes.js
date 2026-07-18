"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("../utils/client");
const moment_1 = __importDefault(require("moment"));
const router = (0, express_1.Router)();
// Create donation record
router.post("/", async (req, res) => {
    try {
        const { contributorName, amount, date, paymentMethod, note, currency, churchId } = req.body;
        const convert1 = (0, moment_1.default)(`${date}`, 'YYYY-MM-DD', true);
        const donation = await client_1.prisma.donation.create({
            data: {
                contributorName,
                amount,
                currency: currency || "HTG",
                date: convert1.toDate(),
                paymentMethod,
                note,
                church: {
                    connect: {
                        id: churchId
                    }
                }
            },
        });
        res.json(donation);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create donation record" });
    }
});
// Get all donations
router.get("/", async (req, res) => {
    try {
        const donations = await client_1.prisma.donation.findMany();
        res.json(donations);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch donations" });
    }
});
// Get donations by church ID with pagination, search, and filtering
router.get("/church/:churchId", async (req, res) => {
    try {
        const { churchId } = req.params;
        const { startDate, endDate, page = '1', limit = '10', search = '', minAmount = '', maxAmount = '', sortBy = 'date', sortOrder = 'desc' } = req.query;
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
        const totalCount = await client_1.prisma.donation.count({ where: whereClause });
        // Get paginated donations
        const donations = await client_1.prisma.donation.findMany({
            where: whereClause,
            orderBy: orderBy,
            skip: skip,
            take: limitNum
        });
        // Calculate total amount
        const totalAmount = donations.reduce((sum, donation) => sum + donation.amount, 0);
        // Calculate pagination metadata
        const totalPages = Math.ceil(totalCount / limitNum);
        const hasNextPage = pageNum < totalPages;
        const hasPreviousPage = pageNum > 1;
        res.json({
            donations,
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
        console.error("Error fetching donations by church:", error);
        res.status(500).json({ error: "Failed to fetch donations by church" });
    }
});
// Get donation by ID
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const donation = await client_1.prisma.donation.findUnique({
            where: { id },
        });
        if (!donation) {
            return res.status(404).json({ error: "Donation record not found" });
        }
        res.json(donation);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch donation record" });
    }
});
// Update donation
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { contributorName, amount, date, paymentMethod, note } = req.body;
        const donation = await client_1.prisma.donation.update({
            where: { id },
            data: {
                contributorName,
                amount,
                date: new Date(date),
                paymentMethod,
                note,
            },
        });
        res.json(donation);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update donation record" });
    }
});
// Delete donation
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await client_1.prisma.donation.delete({
            where: { id },
        });
        res.json({ message: "Donation record deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to delete donation record" });
    }
});
exports.default = router;
