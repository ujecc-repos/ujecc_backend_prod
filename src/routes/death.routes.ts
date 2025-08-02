import express from 'express';
import { prisma } from '../utils/client';
import moment from "moment"
import __ from "lodash"

const router = express.Router();

interface Ires {
    fullname: string;
    deathDate: string;
    deathTime: string;
    deathCause: string;
    deathCertificate?: string;
    nextOfKin: string;
    deathPlace: string;
    relationShip: string;
    officiantName: string;
    description?: string;
    location: string;
    churchId?: string;
  }



// Create a new death record
router.post('/', async (req, res) => {
 const allDate = __.pick(req.body, ["deathDate", "serviceDate"]);
 const rest = __.omit(req.body, ["deathDate", "serviceDate", "churchId"]) as Ires

 const convert1 = moment(`${allDate.deathDate}`, 'YYYY-MM-DD', true);
 const convert2 = moment(`${allDate.serviceDate}`, 'YYYY-MM-DD', true);



  try {
    const death = await prisma.death.create({
      data: {
        ...rest, 
       deathDate: convert1.toDate(),
       serviceDate: convert2.toDate()
      }
    });
    res.json(death);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create death record' });
  }
});

// Get all death records
router.get('/', async (req, res) => {
  try {
    const deaths = await prisma.death.findMany({
      include: {
        church: true
      }
    });
    res.json(deaths);
  } catch (error) {
    res.status(400).json({ error: 'Failed to fetch death records' });
  }
});

// Get a single death record by ID
router.get('/:id', async (req, res) => {
  try {
    const death = await prisma.death.findUnique({
      where: { id: req.params.id },
      include: {
        church: true
      }
    });
    if (!death) {
      return res.status(404).json({ error: 'Death record not found' });
    }
    res.json(death);
  } catch (error) {
    res.status(400).json({ error: 'Failed to fetch death record' });
  }
});

// Update a death record
router.put('/:id', async (req, res) => {
  try {
    const death = await prisma.death.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(death);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update death record' });
  }
});

// Delete a death record
router.delete('/:id', async (req, res) => {
  try {
    await prisma.death.delete({
      where: { id: req.params.id }
    });
    res.json({ message: 'Death record deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete death record' });
  }
});

// Get death records by church ID
router.get('/church/:churchId', async (req, res) => {
  try {
    const deaths = await prisma.death.findMany({
      where: { churchId: req.params.churchId },
      include: {
        church: true
      }
    });
    res.json(deaths);
  } catch (error) {
    res.status(400).json({ error: 'Failed to fetch church death records' });
  }
});

// Get deaths by date range
router.get('/date-range', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const deaths = await prisma.death.findMany({
      where: {
        deathDate: {
          gte: new Date(startDate as string),
          lte: new Date(endDate as string)
        }
      },
      include: {
        church: true
      }
    });
    res.json(deaths);
  } catch (error) {
    res.status(400).json({ error: 'Failed to fetch deaths by date range' });
  }
});

export default router;