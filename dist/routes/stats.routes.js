"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("../utils/client");
const router = (0, express_1.Router)();
// Helper function to parse date or use default
const parseDate = (dateString, defaultDate) => {
    if (!dateString)
        return defaultDate;
    try {
        return new Date(dateString);
    }
    catch (error) {
        return defaultDate;
    }
};
// Get global statistics (total revenue and total expenses) with optional year filter
router.get("/global", async (req, res) => {
    try {
        // Get year from query parameter or use current year as default
        const year = req.query.year ? parseInt(req.query.year) : new Date().getFullYear();
        // Create date range for the specified year
        const startDate = new Date(year, 0, 1); // January 1st of the year
        const endDate = new Date(year, 11, 31, 23, 59, 59, 999); // December 31st of the year (end of day)
        // Date filter for the year
        const dateFilter = {
            date: {
                gte: startDate,
                lte: endDate
            }
        };
        // Calculate total expenses (sum of all expense amounts) for the year
        const totalExpenses = await client_1.prisma.expense.aggregate({
            where: dateFilter,
            _sum: {
                amount: true
            }
        });
        // Calculate total revenue from tithing for the year
        const totalTithing = await client_1.prisma.tithing.aggregate({
            where: dateFilter,
            _sum: {
                amount: true
            }
        });
        // Calculate total revenue from donations for the year
        const totalDonations = await client_1.prisma.donation.aggregate({
            where: dateFilter,
            _sum: {
                amount: true
            }
        });
        // Calculate total revenue from offerings for the year
        const totalOfferings = await client_1.prisma.offering.aggregate({
            where: dateFilter,
            _sum: {
                amount: true
            }
        });
        // Calculate total revenue from moissons for the year
        const totalMoissons = await client_1.prisma.moisson.aggregate({
            where: dateFilter,
            _sum: {
                amount: true
            }
        });
        // Calculate total revenue (sum of tithing, donations, offerings, and moissons)
        const totalRevenue = ((totalTithing._sum.amount || 0) +
            (totalDonations._sum.amount || 0) +
            (totalOfferings._sum.amount || 0) +
            (totalMoissons._sum.amount || 0));
        // Return the statistics
        res.json({
            year,
            totalRevenue,
            totalExpenses: totalExpenses._sum.amount || 0,
            revenueBreakdown: {
                tithing: totalTithing._sum.amount || 0,
                donations: totalDonations._sum.amount || 0,
                offerings: totalOfferings._sum.amount || 0,
                moissons: totalMoissons._sum.amount || 0
            }
        });
    }
    catch (error) {
        console.error("Error calculating global statistics:", error);
        res.status(500).json({ error: "Failed to calculate global statistics" });
    }
});
// Get statistics for a specific church
router.get("/church/:churchId", async (req, res) => {
    try {
        const { churchId } = req.params;
        // Calculate total expenses for the church
        const totalExpenses = await client_1.prisma.expense.aggregate({
            where: {
                churchId: churchId
            },
            _sum: {
                amount: true
            }
        });
        // Calculate total revenue from tithing for the church
        const totalTithing = await client_1.prisma.tithing.aggregate({
            where: {
                churchId: churchId
            },
            _sum: {
                amount: true
            }
        });
        // Calculate total revenue from donations for the church
        const totalDonations = await client_1.prisma.donation.aggregate({
            where: {
                churchId: churchId
            },
            _sum: {
                amount: true
            }
        });
        // Calculate total revenue from offerings for the church
        const totalOfferings = await client_1.prisma.offering.aggregate({
            where: {
                churchId: churchId
            },
            _sum: {
                amount: true
            }
        });
        // Calculate total revenue from moissons for the church
        const totalMoissons = await client_1.prisma.moisson.aggregate({
            where: {
                churchId: churchId
            },
            _sum: {
                amount: true
            }
        });
        // Calculate total revenue for the church
        const totalRevenue = ((totalTithing._sum.amount || 0) +
            (totalDonations._sum.amount || 0) +
            (totalOfferings._sum.amount || 0) +
            (totalMoissons._sum.amount || 0));
        // Return the statistics
        res.json({
            totalRevenue,
            totalExpenses: totalExpenses._sum.amount || 0,
            revenueBreakdown: {
                tithing: totalTithing._sum.amount || 0,
                donations: totalDonations._sum.amount || 0,
                offerings: totalOfferings._sum.amount || 0,
                moissons: totalMoissons._sum.amount || 0
            }
        });
    }
    catch (error) {
        console.error("Error calculating church statistics:", error);
        res.status(500).json({ error: "Failed to calculate church statistics" });
    }
});
// Get statistics for a specific time period
router.get("/period", async (req, res) => {
    try {
        const { startDate: startDateStr, endDate: endDateStr } = req.query;
        // Set default date range to current year if not provided
        const now = new Date();
        const defaultStartDate = new Date(now.getFullYear(), 0, 1); // First day of current year
        const defaultEndDate = new Date(now.getFullYear(), 11, 31); // Last day of current year
        // Parse dates or use defaults
        const startDate = parseDate(startDateStr, defaultStartDate);
        const endDate = parseDate(endDateStr, defaultEndDate);
        // Date filter for queries
        const dateFilter = {
            gte: startDate,
            lte: endDate
        };
        // Calculate total expenses for the period
        const totalExpenses = await client_1.prisma.expense.aggregate({
            where: {
                date: dateFilter
            },
            _sum: {
                amount: true
            }
        });
        // Calculate total revenue from tithing for the period
        const totalTithing = await client_1.prisma.tithing.aggregate({
            where: {
                date: dateFilter
            },
            _sum: {
                amount: true
            }
        });
        // Calculate total revenue from donations for the period
        const totalDonations = await client_1.prisma.donation.aggregate({
            where: {
                date: dateFilter
            },
            _sum: {
                amount: true
            }
        });
        // Calculate total revenue from offerings for the period
        const totalOfferings = await client_1.prisma.offering.aggregate({
            where: {
                date: dateFilter
            },
            _sum: {
                amount: true
            }
        });
        // Calculate total revenue from moissons for the period
        const totalMoissons = await client_1.prisma.moisson.aggregate({
            where: {
                date: dateFilter
            },
            _sum: {
                amount: true
            }
        });
        // Calculate total revenue for the period
        const totalRevenue = ((totalTithing._sum.amount || 0) +
            (totalDonations._sum.amount || 0) +
            (totalOfferings._sum.amount || 0) +
            (totalMoissons._sum.amount || 0));
        // Return the statistics
        res.json({
            period: {
                startDate: startDate.toISOString().split('T')[0],
                endDate: endDate.toISOString().split('T')[0]
            },
            totalRevenue,
            totalExpenses: totalExpenses._sum.amount || 0,
            revenueBreakdown: {
                tithing: totalTithing._sum.amount || 0,
                donations: totalDonations._sum.amount || 0,
                offerings: totalOfferings._sum.amount || 0,
                moissons: totalMoissons._sum.amount || 0
            }
        });
    }
    catch (error) {
        console.error("Error calculating period statistics:", error);
        res.status(500).json({ error: "Failed to calculate period statistics" });
    }
});
// Get monthly statistics for the current year
router.get("/monthly", async (req, res) => {
    try {
        const { year: yearStr } = req.query;
        // Use provided year or default to current year
        const year = yearStr ? parseInt(yearStr) : new Date().getFullYear();
        // Initialize monthly data structure
        const months = Array.from({ length: 12 }, (_, i) => {
            return {
                month: i + 1,
                name: new Date(year, i, 1).toLocaleString('default', { month: 'long' }),
                revenue: 0,
                expenses: 0,
                revenueBreakdown: {
                    tithing: 0,
                    donations: 0,
                    offerings: 0,
                    moissons: 0
                }
            };
        });
        // Get all financial data for the year
        const startDate = new Date(year, 0, 1); // January 1st
        const endDate = new Date(year, 11, 31); // December 31st
        // Date filter for the year
        const yearFilter = {
            gte: startDate,
            lte: endDate
        };
        // Fetch all financial data for the year
        const [expenses, tithings, donations, offerings, moissons] = await Promise.all([
            client_1.prisma.expense.findMany({
                where: { date: yearFilter },
                select: { amount: true, date: true }
            }),
            client_1.prisma.tithing.findMany({
                where: { date: yearFilter },
                select: { amount: true, date: true }
            }),
            client_1.prisma.donation.findMany({
                where: { date: yearFilter },
                select: { amount: true, date: true }
            }),
            client_1.prisma.offering.findMany({
                where: { date: yearFilter },
                select: { amount: true, date: true }
            }),
            client_1.prisma.moisson.findMany({
                where: { date: yearFilter },
                select: { amount: true, date: true }
            })
        ]);
        // Process expenses data
        expenses.forEach(expense => {
            const month = expense.date.getMonth();
            months[month].expenses += expense.amount;
        });
        // Process tithing data
        tithings.forEach(tithing => {
            const month = tithing.date.getMonth();
            months[month].revenueBreakdown.tithing += tithing.amount;
            months[month].revenue += tithing.amount;
        });
        // Process donations data
        donations.forEach(donation => {
            const month = donation.date.getMonth();
            months[month].revenueBreakdown.donations += donation.amount;
            months[month].revenue += donation.amount;
        });
        // Process offerings data
        offerings.forEach(offering => {
            const month = offering.date.getMonth();
            months[month].revenueBreakdown.offerings += offering.amount;
            months[month].revenue += offering.amount;
        });
        // Process moissons data
        moissons.forEach(moisson => {
            const month = moisson.date.getMonth();
            months[month].revenueBreakdown.moissons += moisson.amount;
            months[month].revenue += moisson.amount;
        });
        // Calculate yearly totals
        const yearlyTotals = {
            totalRevenue: months.reduce((sum, month) => sum + month.revenue, 0),
            totalExpenses: months.reduce((sum, month) => sum + month.expenses, 0),
            revenueBreakdown: {
                tithing: months.reduce((sum, month) => sum + month.revenueBreakdown.tithing, 0),
                donations: months.reduce((sum, month) => sum + month.revenueBreakdown.donations, 0),
                offerings: months.reduce((sum, month) => sum + month.revenueBreakdown.offerings, 0),
                moissons: months.reduce((sum, month) => sum + month.revenueBreakdown.moissons, 0)
            }
        };
        // Return the monthly statistics
        res.json({
            year,
            months,
            yearlyTotals
        });
    }
    catch (error) {
        console.error("Error calculating monthly statistics:", error);
        res.status(500).json({ error: "Failed to calculate monthly statistics" });
    }
});
exports.default = router;
