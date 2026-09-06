"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("../utils/client");
const moment_1 = __importDefault(require("moment"));
const router = (0, express_1.Router)();
// Define expense types
const EXPENSE_TYPE = {
    CURRENT: 'CURRENT',
    GLOBAL: 'GLOBAL'
};
// Create expense
router.post("/", async (req, res) => {
    try {
        const { amount, quantity, category, date, paymentMethod, description, currency } = req.body;
        const convert1 = (0, moment_1.default)(`${date}`, 'YYYY-MM-DD', true);
        const expense = await client_1.prisma.expense.create({
            data: {
                amount,
                // quantity: quantity || 1,
                category,
                currency: currency || "HTG",
                date: convert1.toDate(),
                paymentMethod,
                description,
                church: {
                    connect: {
                        id: req.body.churchId,
                    }
                }
            },
        });
        res.json(expense);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create expense" });
    }
});
// Get all expenses
router.get("/", async (req, res) => {
    try {
        const expenses = await client_1.prisma.expense.findMany();
        res.json(expenses);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch expenses" });
    }
});
// Get expenses by church ID with pagination, search, and filtering
router.get("/church/:churchId", async (req, res) => {
    try {
        const { churchId } = req.params;
        const { type, page = '1', limit = '10', search = '', category = '', minAmount = '', maxAmount = '', sortBy = 'date', sortOrder = 'desc' } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        // Get current date
        const now = new Date();
        let startDate, endDate;
        // Set date range based on expense type
        if (type === EXPENSE_TYPE.CURRENT) {
            // Current expenses: current month
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        }
        else if (type === EXPENSE_TYPE.GLOBAL) {
            // Global expenses: current year
            startDate = new Date(now.getFullYear(), 0, 1);
            endDate = new Date(now.getFullYear(), 11, 31);
        }
        // Build where clause
        const whereClause = {
            churchId: churchId
        };
        // Add date filter if type is specified
        if (startDate && endDate) {
            whereClause.date = {
                gte: startDate,
                lte: endDate
            };
        }
        // Add search filter for description
        if (search) {
            whereClause.description = {
                contains: search,
                mode: 'insensitive'
            };
        }
        // Add category filter
        if (category) {
            whereClause.category = category;
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
        const totalCount = await client_1.prisma.expense.count({ where: whereClause });
        // Get paginated expenses
        const expenses = await client_1.prisma.expense.findMany({
            where: whereClause,
            orderBy: orderBy,
            skip: skip,
            take: limitNum
        });
        // Calculate total amount
        const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
        // Calculate pagination metadata
        const totalPages = Math.ceil(totalCount / limitNum);
        const hasNextPage = pageNum < totalPages;
        const hasPreviousPage = pageNum > 1;
        res.json({
            expenses,
            totalAmount,
            pagination: {
                currentPage: pageNum,
                totalPages,
                totalCount,
                limit: limitNum,
                hasNextPage,
                hasPreviousPage
            },
            period: type === EXPENSE_TYPE.CURRENT ? 'monthly' : 'yearly'
        });
    }
    catch (error) {
        console.error("Error fetching expenses by church:", error);
        res.status(500).json({ error: "Failed to fetch expenses by church" });
    }
});
// Get monthly expenses summary for a church (for charts)
router.get("/church/:churchId/monthly-summary", async (req, res) => {
    try {
        const { churchId } = req.params;
        const { year } = req.query;
        const targetYear = year ? parseInt(year) : new Date().getFullYear();
        const monthlySummary = [];
        for (let month = 0; month < 12; month++) {
            const startDate = new Date(targetYear, month, 1);
            const endDate = new Date(targetYear, month + 1, 0);
            const expenses = await client_1.prisma.expense.findMany({
                where: {
                    churchId: churchId,
                    date: {
                        gte: startDate,
                        lte: endDate
                    }
                }
            });
            const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
            monthlySummary.push({
                month: month + 1,
                totalAmount,
                count: expenses.length
            });
        }
        res.json({
            year: targetYear,
            monthlySummary
        });
    }
    catch (error) {
        console.error("Error fetching monthly expense summary:", error);
        res.status(500).json({ error: "Failed to fetch monthly expense summary" });
    }
});
// Get quarterly expenses summary for a church (for charts)
router.get("/church/:churchId/quarterly-summary", async (req, res) => {
    try {
        const { churchId } = req.params;
        const { year } = req.query;
        const targetYear = year ? parseInt(year) : new Date().getFullYear();
        const quarterlySummary = [];
        for (let quarter = 0; quarter < 4; quarter++) {
            const startMonth = quarter * 3;
            const startDate = new Date(targetYear, startMonth, 1);
            const endDate = new Date(targetYear, startMonth + 3, 0);
            const expenses = await client_1.prisma.expense.findMany({
                where: {
                    churchId: churchId,
                    date: {
                        gte: startDate,
                        lte: endDate
                    }
                }
            });
            const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
            quarterlySummary.push({
                quarter: quarter + 1,
                totalAmount,
                count: expenses.length
            });
        }
        res.json({
            year: targetYear,
            quarterlySummary
        });
    }
    catch (error) {
        console.error("Error fetching quarterly expense summary:", error);
        res.status(500).json({ error: "Failed to fetch quarterly expense summary" });
    }
});
// Get expenses by category for a church
router.get("/church/:churchId/by-category", async (req, res) => {
    try {
        const { churchId } = req.params;
        const { period } = req.query;
        const now = new Date();
        let startDate, endDate;
        if (period === 'month') {
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        }
        else if (period === 'year') {
            startDate = new Date(now.getFullYear(), 0, 1);
            endDate = new Date(now.getFullYear(), 11, 31);
        }
        const expenses = await client_1.prisma.expense.findMany({
            where: {
                churchId: churchId,
                ...(startDate && endDate ? {
                    date: {
                        gte: startDate,
                        lte: endDate
                    }
                } : {})
            }
        });
        const categorySummary = {};
        expenses.forEach(expense => {
            if (!categorySummary[expense.category]) {
                categorySummary[expense.category] = {
                    totalAmount: 0,
                    count: 0
                };
            }
            categorySummary[expense.category].totalAmount += expense.amount;
            categorySummary[expense.category].count += 1;
        });
        const result = Object.keys(categorySummary).map(category => ({
            category,
            totalAmount: categorySummary[category].totalAmount,
            count: categorySummary[category].count
        }));
        res.json({
            period: period || 'all',
            categories: result
        });
    }
    catch (error) {
        console.error("Error fetching expenses by category:", error);
        res.status(500).json({ error: "Failed to fetch expenses by category" });
    }
});
// Get expense by ID
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const expense = await client_1.prisma.expense.findUnique({
            where: { id },
        });
        if (!expense) {
            return res.status(404).json({ error: "Expense not found" });
        }
        res.json(expense);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch expense" });
    }
});
// Update expense
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { amount, quantity, category, date, paymentMethod, description, currency } = req.body;
        const expense = await client_1.prisma.expense.update({
            where: { id },
            data: {
                amount,
                // quantity,
                category,
                date: new Date(date),
                paymentMethod,
                description,
                currency,
            },
        });
        res.json(expense);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update expense" });
    }
});
// Delete expense
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await client_1.prisma.expense.delete({
            where: { id },
        });
        res.json({ message: "Expense deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to delete expense" });
    }
});
exports.default = router;
