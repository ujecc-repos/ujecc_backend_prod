import { Router } from "express";
import { prisma } from "../utils/client";
import moment from "moment";

const router = Router();

// Create moisson record
router.post("/", async (req, res) => {
  try {
    const { contributorName, amount, date, paymentMethod, note, churchId } = req.body;
    const convert1 = moment(`${date}`, 'YYYY-MM-DD', true);
    
    // Add status field with default value to satisfy TypeScript requirements
    // Note: This field is required by the Prisma client type but may not exist in the database yet
    // You'll need to run a migration to add this field to the database
    const moisson = await prisma.moisson.create({
      data: {
        contributorName,
        amount,
        date: convert1.toDate(),
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
  } catch (error) {
    res.status(500).json({ error: "Failed to create moisson record" });
  }
});

// Get all moisson records
router.get("/", async (req, res) => {
  try {
    const moissons = await prisma.moisson.findMany();
    res.json(moissons);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch moisson records" });
  }
});

// Get moisson by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const moisson = await prisma.moisson.findUnique({
      where: { id },
    });
    if (!moisson) {
      return res.status(404).json({ error: "Moisson record not found" });
    }
    res.json(moisson);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch moisson record" });
  }
});

// Get moissons by church ID
router.get("/church/:churchId", async (req, res) => {
  try {
    const { churchId } = req.params;
    const { startDate, endDate } = req.query;
    
    // Query parameters
    const queryParams: any = {
      where: {
        churchId: churchId
      }
    };
    
    // Add date filter if provided
    if (startDate && endDate) {
      queryParams.where.date = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string)
      };
    }
    
    const moissons = await prisma.moisson.findMany(queryParams);
    
    // Calculate total amount
    const totalAmount = moissons.reduce((sum, moisson) => sum + moisson.amount, 0);
    
    res.json({
      moissons,
      totalAmount,
      period: startDate && endDate ? `${startDate} to ${endDate}` : 'all'
    });
  } catch (error) {
    console.error("Error fetching moissons by church:", error);
    res.status(500).json({ error: "Failed to fetch moissons by church" });
  }
});

// Update moisson record
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { contributorName, amount, date, paymentMethod, note, status, churchId } = req.body;
    const moisson = await prisma.moisson.update({
      where: { id },
      data: {
        contributorName,
        amount,
        date: new Date(date),
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
  } catch (error) {
    res.status(500).json({ error: "Failed to update moisson record" });
  }
});

// Delete moisson record
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.moisson.delete({
      where: { id },
    });
    res.json({ message: "Moisson record deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete moisson record" });
  }
});

export default router;