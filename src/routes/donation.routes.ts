import { Router } from "express";
import { prisma } from "../utils/client";
import moment from "moment"

const router = Router();

// Create donation record
router.post("/", async (req, res) => {
  try {
    const { contributorName, amount, date, paymentMethod, note, churchId } = req.body;
    const convert1 = moment(`${date}`, 'YYYY-MM-DD', true);
    
    const donation = await prisma.donation.create({
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
    res.json(donation);
  } catch (error) {
    res.status(500).json({ error: "Failed to create donation record" });
  }
});

// Get all donations
router.get("/", async (req, res) => {
  try {
    const donations = await prisma.donation.findMany();
    res.json(donations);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch donations" });
  }
});

// Get donations by church ID
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
    
    const donations = await prisma.donation.findMany(queryParams);
    
    // Calculate total amount
    const totalAmount = donations.reduce((sum, donation) => sum + donation.amount, 0);
    
    res.json({
      donations,
      totalAmount,
      period: startDate && endDate ? `${startDate} to ${endDate}` : 'all'
    });
  } catch (error) {
    console.error("Error fetching donations by church:", error);
    res.status(500).json({ error: "Failed to fetch donations by church" });
  }
});

// Get donation by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const donation = await prisma.donation.findUnique({
      where: { id },
    });
    if (!donation) {
      return res.status(404).json({ error: "Donation record not found" });
    }
    res.json(donation);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch donation record" });
  }
});

// Update donation
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { contributorName, amount, date, paymentMethod, note } = req.body;
    const donation = await prisma.donation.update({
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
  } catch (error) {
    res.status(500).json({ error: "Failed to update donation record" });
  }
});

// Delete donation
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.donation.delete({
      where: { id },
    });
    res.json({ message: "Donation record deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete donation record" });
  }
});

export default router;