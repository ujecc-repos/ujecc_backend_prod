import { Router } from "express";
import { prisma } from "../utils/client";
import moment from "moment"

const router = Router();

// Create tithing record
router.post("/", async (req, res) => {
  try {
    const { contributorName, amount, date, paymentMethod, note, churchId } = req.body;
    const convert1 = moment(`${date}`, 'YYYY-MM-DD', true);
    const tithing = await prisma.tithing.create({
      data: {
        contributorName,
        amount,
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

// Get tithings by church ID
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
    
    const tithings = await prisma.tithing.findMany(queryParams);
    
    // Calculate total amount
    const totalAmount = tithings.reduce((sum, tithing) => sum + tithing.amount, 0);
    
    res.json({
      tithings,
      totalAmount,
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