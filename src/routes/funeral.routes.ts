import express from 'express';
import { prisma } from '../utils/client';
import __ from "lodash";
import moment from "moment" 
import upload from '../utils/upload';
import path from 'path';

const router = express.Router();

interface Irest {
    fullname: string;
    birthDate: string;
    funeralDate: string;
    funeralTime: string;
    relationShip: string;
    email: string;
    deathCertificate?: string;
    nextOfKin: string;
    officiantName: string;
    description: string;
    funeralLocation: string;
    status?: string;
    churchId?: string;
  }

// Create a new funeral record
router.post('/', upload.fields([
  { name: 'deathCertificate', maxCount: 1 }
]), async (req, res) => {
  try {
    const allDate = __.pick(req.body, ["birthDate", "funeralDate"])
    const rest = __.omit(req.body, ["birthDate", "funeralDate", "churchId"]) as Irest
    
    const convert1 = moment(`${allDate.birthDate}`, 'YYYY-MM-DD', true);
    const convert2 = moment(`${allDate.funeralDate}`, 'YYYY-MM-DD', true);

    // Handle file uploads
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    
    // Get file path if it exists
    const deathCertificatePath = files?.deathCertificate ? 
      `/uploads/${path.basename(files.deathCertificate[0].path)}` : null;
    
    // Préparer les données pour la création
    const createData: any = {
      ...rest, 
      birthDate: convert1.toDate(), 
      funeralDate: convert2.toDate(),
      deathCertificate: deathCertificatePath
    };
    
    // Ajouter la relation church si churchId est fourni
    if (req.body.churchId) {
      createData.church = {
        connect: {
          id: req.body.churchId
        }
      };
      // Supprimer churchId de l'objet rest pour éviter le conflit
      delete createData.churchId;
    }
    
    const funeral = await prisma.funeral.create({
      data: createData
    });
    res.json(funeral);
  } catch (error) {
    console.error('Error creating funeral record:', error);
    res.status(400).json({ error: 'Failed to create funeral record' });
  }
});

// Get all funeral records
router.get('/', async (req, res) => {
  try {
    const funerals = await prisma.funeral.findMany({
      include: {
        church: true
      }
    });
    res.json(funerals);
  } catch (error) {
    res.status(400).json({ error: 'Failed to fetch funeral records' });
  }
});

// Get a single funeral record by ID
router.get('/:id', async (req, res) => {
  try {
    const funeral = await prisma.funeral.findUnique({
      where: { id: req.params.id },
      include: {
        church: true
      }
    });
    if (!funeral) {
      return res.status(404).json({ error: 'Funeral record not found' });
    }
    res.json(funeral);
  } catch (error) {
    res.status(400).json({ error: 'Failed to fetch funeral record' });
  }
});

// Update a funeral record
router.put('/:id', upload.fields([
  { name: 'deathCertificate', maxCount: 1 }
]), async (req, res) => {
  try {
    // Handle dates if present
    let updateData: any = { ...req.body };
    
    if (req.body.birthDate) {
      const convertedBirthDate = moment(req.body.birthDate, 'YYYY-MM-DD', true);
      updateData.birthDate = convertedBirthDate.toDate();
    }
    
    if (req.body.funeralDate) {
      const convertedFuneralDate = moment(req.body.funeralDate, 'YYYY-MM-DD', true);
      updateData.funeralDate = convertedFuneralDate.toDate();
    }
    
    // Handle file uploads
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    
    // Get file path if it exists
    if (files?.deathCertificate) {
      updateData.deathCertificate = `/uploads/${path.basename(files.deathCertificate[0].path)}`;
    }
    
    // Handle church relationship if churchId is provided
    if (updateData.churchId) {
      updateData.church = {
        connect: {
          id: updateData.churchId
        }
      };
      // Remove churchId to avoid conflicts
      delete updateData.churchId;
    }
    
    const funeral = await prisma.funeral.update({
      where: { id: req.params.id },
      data: updateData
    });
    
    res.json(funeral);
  } catch (error) {
    console.error('Error updating funeral record:', error);
    res.status(400).json({ error: 'Failed to update funeral record' });
  }
});

// Delete a funeral record
router.delete('/:id', async (req, res) => {
  try {
    await prisma.funeral.delete({
      where: { id: req.params.id }
    });
    res.json({ message: 'Funeral record deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete funeral record' });
  }
});

// Get funeral records by church ID
router.get('/church/:churchId', async (req, res) => {
  try {
    const funerals = await prisma.funeral.findMany({
      where: { churchId: req.params.churchId },
      include: {
        church: true
      }
    });
    res.json(funerals);
  } catch (error) {
    res.status(400).json({ error: 'Failed to fetch church funeral records' });
  }
});

// Get funerals by date range
router.get('/date-range', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const funerals = await prisma.funeral.findMany({
      where: {
        funeralDate: {
          gte: new Date(startDate as string),
          lte: new Date(endDate as string)
        }
      },
      include: {
        church: true
      }
    });
    res.json(funerals);
  } catch (error) {
    res.status(400).json({ error: 'Failed to fetch funerals by date range' });
  }
});

export default router;