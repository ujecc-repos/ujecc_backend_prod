import express from 'express';
import { prisma } from '../utils/client';
import moment from "moment"
import __ from "lodash"
import upload from '../utils/upload';
import path from 'path';

const router = express.Router();


interface Ires {
    childName: string;
    presentationDate: string; // likely YYYY-MM-DD format
    dateOfBirth: string;     // likely YYYY-MM-DD format
    placeOfBirth: string;
    fatherName: string;
    motherName: string;
    officiantName: string;
    address: string;
    phone: string;
    witness: string;
    description: string;
    churchId?: string
}

// Create a new presentation record
router.post('/', upload.fields([
  { name: 'birthCertificate', maxCount: 1 }
]), async (req, res) => {
  try {
    const {
      childName,
      presentationDate,
      dateOfBirth,
      placeOfBirth,
      fatherName,
      motherName,
      officiantName,
      address,
      phone,
      witness,
      description,
      churchId
    } = req.body;
    
    // Handle file uploads
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    
    // Get file path if it exists
    const birthCertificatePath = files?.birthCertificate ? 
      `/uploads/${path.basename(files.birthCertificate[0].path)}` : null;
    
    const convert1 = moment(`${presentationDate}`, 'YYYY-MM-DD', true);
    const convert2 = moment(`${dateOfBirth}`, 'YYYY-MM-DD', true);
    
    const presentation = await prisma.presentation.create({
      data: {
        childName,
        presentationDate: convert1.toDate(),
        dateOfBirth: convert2.toDate(),
        placeOfBirth,
        fatherName,
        motherName,
        officiantName,
        address,
        phone,
        witness,
        description,
        birthCertificate: birthCertificatePath,
        church: churchId ? {
          connect: {
            id: churchId
          }
        } : undefined
      }
    });
    
    res.status(201).json(presentation);
  } catch (error) {
    console.error('Error creating presentation record:', error);
    res.status(400).json({ error: 'Failed to create presentation record' });
  }
});

// Get all presentation records
router.get('/', async (req, res) => {
  try {
    const presentations = await prisma.presentation.findMany({
      include: {
        church: true
      }
    });
    res.json(presentations);
  } catch (error) {
    res.status(400).json({ error: 'Failed to fetch presentation records' });
  }
});

// Get a single presentation record by ID
router.get('/:id', async (req, res) => {
  try {
    const presentation = await prisma.presentation.findUnique({
      where: { id: req.params.id },
      include: {
        church: true
      }
    });
    if (!presentation) {
      return res.status(404).json({ error: 'Presentation record not found' });
    }
    res.json(presentation);
  } catch (error) {
    res.status(400).json({ error: 'Failed to fetch presentation record' });
  }
});

// Update a presentation record
router.put('/:id', async (req, res) => {
  try {
    const presentation = await prisma.presentation.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(presentation);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update presentation record' });
  }
});

// Delete a presentation record
router.delete('/:id', async (req, res) => {
  try {
    await prisma.presentation.delete({
      where: { id: req.params.id }
    });
    res.json({ message: 'Presentation record deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete presentation record' });
  }
});

// Get presentation records by church ID
router.get('/church/:churchId', async (req, res) => {
  try {
    const presentations = await prisma.presentation.findMany({
      where: { churchId: req.params.churchId },
      include: {
        church: true
      }
    });
    res.json(presentations);
  } catch (error) {
    res.status(400).json({ error: 'Failed to fetch church presentation records' });
  }
});

// Get presentations by date range
router.get('/date-range', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const presentations = await prisma.presentation.findMany({
      where: {
        presentationDate: {
          gte: new Date(startDate as string),
          lte: new Date(endDate as string)
        }
      },
      include: {
        church: true
      }
    });
    res.json(presentations);
  } catch (error) {
    res.status(400).json({ error: 'Failed to fetch presentations by date range' });
  }
});

export default router;