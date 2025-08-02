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
        const { amount, category, date, paymentMethod, description } = req.body;
        const convert1 = (0, moment_1.default)(`${date}`, 'YYYY-MM-DD', true);
        const expense = await client_1.prisma.expense.create({
            data: {
                amount,
                category,
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
// Get expenses by church ID with type filter (current or global)
router.get("/church/:churchId", async (req, res) => {
    try {
        const { churchId } = req.params;
        const { type } = req.query;
        // Get current date
        const now = new Date();
        let startDate, endDate;
        // Set date range based on expense type
        if (type === EXPENSE_TYPE.CURRENT) {
            // Current expenses: current month
            startDate = new Date(now.getFullYear(), now.getMonth(), 1); // First day of current month
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0); // Last day of current month
        }
        else if (type === EXPENSE_TYPE.GLOBAL) {
            // Global expenses: current year
            startDate = new Date(now.getFullYear(), 0, 1); // First day of current year
            endDate = new Date(now.getFullYear(), 11, 31); // Last day of current year
        }
        // Query parameters
        const queryParams = {
            where: {
                churchId: churchId
            }
        };
        // Add date filter if type is specified
        if (startDate && endDate) {
            queryParams.where.date = {
                gte: startDate,
                lte: endDate
            };
        }
        const expenses = await client_1.prisma.expense.findMany(queryParams);
        // Calculate total amount
        const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
        res.json({
            expenses,
            totalAmount,
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
        // Use current year if not specified
        const targetYear = year ? parseInt(year) : new Date().getFullYear();
        // Create array to hold monthly data
        const monthlySummary = [];
        // Get data for each month
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
                month: month + 1, // 1-12
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
        // Use current year if not specified
        const targetYear = year ? parseInt(year) : new Date().getFullYear();
        // Create array to hold quarterly data
        const quarterlySummary = [];
        // Get data for each quarter
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
                quarter: quarter + 1, // Q1, Q2, Q3, Q4
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
        const { period } = req.query; // 'month' or 'year'
        // Get current date
        const now = new Date();
        let startDate, endDate;
        // Set date range based on period
        if (period === 'month') {
            startDate = new Date(now.getFullYear(), now.getMonth(), 1); // First day of current month
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0); // Last day of current month
        }
        else if (period === 'year') {
            startDate = new Date(now.getFullYear(), 0, 1); // First day of current year
            endDate = new Date(now.getFullYear(), 11, 31); // Last day of current year
        }
        // Query expenses
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
        // Group expenses by category
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
        // Convert to array format
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
        const { amount, category, date, paymentMethod, description } = req.body;
        const expense = await client_1.prisma.expense.update({
            where: { id },
            data: {
                amount,
                category,
                date: new Date(date),
                paymentMethod,
                description,
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
