import { Router } from "express";
import { prisma } from "../utils/client";
import moment from "moment"

const router = Router();

// Create offering
router.post("/", async (req, res) => {
  try {
    const { amount, date, paymentMethod, note, churchId, status } = req.body;
    const convert1 = moment(`${date}`, 'YYYY-MM-DD', true);
    const offering = await prisma.offering.create({
      data: {
        amount,
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
  } catch (error) {
    res.status(500).json({ error: "Failed to create offering record" });
  }
});

// Get all offerings
router.get("/", async (req, res) => {
  try {
    const offerings = await prisma.offering.findMany();
    res.json(offerings);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch offerings" });
  }
});

// Get offerings by church ID
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
    
    const offerings = await prisma.offering.findMany(queryParams);
    
    // Calculate total amount
    const totalAmount = offerings.reduce((sum, offering) => sum + offering.amount, 0);
    
    res.json({
      offerings,
      totalAmount,
      period: startDate && endDate ? `${startDate} to ${endDate}` : 'all'
    });
  } catch (error) {
    console.error("Error fetching offerings by church:", error);
    res.status(500).json({ error: "Failed to fetch offerings by church" });
  }
});

// Get offering by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const offering = await prisma.offering.findUnique({
      where: { id },
    });
    if (!offering) {
      return res.status(404).json({ error: "Offering record not found" });
    }
    res.json(offering);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch offering record" });
  }
});

// Update offering
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, date, paymentMethod, note } = req.body;
    const offering = await prisma.offering.update({
      where: { id },
      data: {
        amount,
        date: new Date(date),
        paymentMethod,
        note,
      },
    });
    res.json(offering);
  } catch (error) {
    res.status(500).json({ error: "Failed to update offering record" });
  }
});

// Delete offering
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.offering.delete({
      where: { id },
    });
    res.json({ message: "Offering record deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete offering record" });
  }
});

export default router;