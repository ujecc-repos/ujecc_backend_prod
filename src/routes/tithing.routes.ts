import { Router } from "express";
import { prisma } from "../utils/client";
import moment from "moment"

const router = Router();

// Create tithing record
router.post("/", async (req, res) => {
    try {
        const { contributorName, amount, date, paymentMethod, note, currency, churchId } = req.body;
        const convert1 = moment(`${date}`, 'YYYY-MM-DD', true);
        const tithing = await prisma.tithing.create({
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
        res.json(tithing);
    } catch (error) {
        console.log("tithing error : ", error)
        res.status(500).json({ error: error });
    }
});

// Get all tithing records
router.get("/", async (req, res) => {
    try {
        const tithings = await prisma.tithing.findMany();
        res.json(tithings);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch tithing records" });
    }
});

// Get tithings by church ID with pagination, search, and filtering
router.get("/church/:churchId", async (req, res) => {
    try {
        const { churchId } = req.params;
        const {
            startDate,
            endDate,
            page = '1',
            limit = '10',
            search = '',
            minAmount = '',
            maxAmount = '',
            sortBy = 'date',
            sortOrder = 'desc'
        } = req.query;

        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const skip = (pageNum - 1) * limitNum;

        // Build where clause
        const whereClause: any = {
            churchId: churchId
        };

        // Add date filter if provided
        if (startDate && endDate) {
            whereClause.date = {
                gte: new Date(startDate as string),
                lte: new Date(endDate as string)
            };
        }

        // Add search filter for contributorName
        if (search) {
            whereClause.contributorName = {
                contains: search as string,
                mode: 'insensitive'
            };
        }

        // Add amount range filter
        if (minAmount || maxAmount) {
            whereClause.amount = {};
            if (minAmount) {
                whereClause.amount.gte = parseFloat(minAmount as string);
            }
            if (maxAmount) {
                whereClause.amount.lte = parseFloat(maxAmount as string);
            }
        }

        // Build orderBy clause
        const orderBy: any = {};
        orderBy[sortBy as string] = sortOrder as string;

        // Get total count for pagination
        const totalCount = await prisma.tithing.count({ where: whereClause });

        // Get paginated tithings
        const tithings = await prisma.tithing.findMany({
            where: whereClause,
            orderBy: orderBy,
            skip: skip,
            take: limitNum
        });

        // Calculate total amount
        const totalAmount = tithings.reduce((sum, tithing) => sum + tithing.amount, 0);

        // Calculate pagination metadata
        const totalPages = Math.ceil(totalCount / limitNum);
        const hasNextPage = pageNum < totalPages;
        const hasPreviousPage = pageNum > 1;

        res.json({
            tithings,
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
    } catch (error) {
        console.error("Error fetching tithings by church:", error);
        res.status(500).json({ error: "Failed to fetch tithings by church" });
    }
});

// Get tithing record by ID
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const tithing = await prisma.tithing.findUnique({
            where: { id },
        });
        if (!tithing) {
            return res.status(404).json({ error: "Tithing record not found" });
        }
        res.json(tithing);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch tithing record" });
    }
});

// Update tithing record
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { contributorName, amount, date, paymentMethod, note } = req.body;
        const tithing = await prisma.tithing.update({
            where: { id },
            data: {
                contributorName,
                amount,
                date: new Date(date),
                paymentMethod,
                note,
            },
        });
        res.json(tithing);
    } catch (error) {
        res.status(500).json({ error: error });
    }
});

// Delete tithing record
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.tithing.delete({
            where: { id },
        });
        res.json({ message: "Tithing record deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete tithing record" });
    }
});

export default router;
