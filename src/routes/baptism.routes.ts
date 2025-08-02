import express from 'express';
import { prisma } from '../utils/client';
import __ from "lodash"
import moment from "moment";
import upload from '../utils/upload';

const router = express.Router();

interface IDate {
    baptismDate: string;
    conversionDate: string;
    birthDate: string;
    baptismClassDate: string;
}

interface Ires {
  fullName: string;
  baptismLocation: string;
  officiantName: string;
  withness: string;
  placeOfBirth: string;
  testimony: string;
  previousChurch: string;
  status?: string;
  isCatechumene?: string;
  catechumeneStartDate?: string;
  catechumeneEndDate?: string;
}

// Create a new baptism record
router.post('/', upload.single('baptismCertificate'), async (req, res) => {
  const allDate = __.pick(req.body, ["baptismDate", "conversionDate", "birthDate", "baptismClassDate"]) as IDate;
  const rest = __.omit(req.body, ["baptismDate", "conversionDate", "birthDate", "baptismClassDate", "churchId", "catechumeneStartDate", "catechumeneEndDate", "isCatechumene"]) as Ires;
  
  // Handle catechumene dates separately
  const catechumeneStartDate = req.body.catechumeneStartDate;
  const catechumeneEndDate = req.body.catechumeneEndDate;
  // Ensure all required fields are present
  if (!rest.fullName || !allDate.baptismDate) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Parse it safely with moment
const convert1 = moment(`${allDate.baptismClassDate}`, 'YYYY-MM-DD', true);
const convert2 = moment(`${allDate.birthDate}`, 'YYYY-MM-DD', true);
const convert3 = moment(`${allDate.baptismDate}`, 'YYYY-MM-DD', true);
const convert4 = moment(`${allDate.conversionDate}`, 'YYYY-MM-DD', true);

// Parse catechumene dates if they exist
const convertCatechumeneStart = catechumeneStartDate ? moment(`${catechumeneStartDate}`, 'YYYY-MM-DD', true) : null;
const convertCatechumeneEnd = catechumeneEndDate ? moment(`${catechumeneEndDate}`, 'YYYY-MM-DD', true) : null;
  try {
    // Get the file path if a file was uploaded
    const baptismCertificate = req.file ? req.file.path : null;
    
    const baptism = await prisma.baptism.create({
      data: {
        ...rest, 
        birthDate: convert2.toDate(), 
        baptismDate: convert3.toDate(), 
        conversionDate: convert4.toDate(),
        startDate: convertCatechumeneStart ? convertCatechumeneStart.format('YYYY-MM-DD') : null,
        endDate: convertCatechumeneEnd ? convertCatechumeneEnd.format('YYYY-MM-DD') : null,
        baptismCertificate,
        church: {
          connect: {
            id: `${req.body.churchId}`
          }
        }
      },
    });
    res.json(baptism);
  } catch (error) {
    console.log("error : ", error)
    res.status(400).json({ error: error });
  }
});

// Get all baptism records
router.get('/', async (req, res) => {
  try {
    const baptisms = await prisma.baptism.findMany({
      include: {
        church: true
      }
    });
    res.json(baptisms);
  } catch (error) {
    res.status(400).json({ error: 'Failed to fetch baptism records' });
  }
});

// Get a single baptism record by ID
router.get('/:id', async (req, res) => {
  try {
    const baptism = await prisma.baptism.findUnique({
      where: { id: req.params.id },
      include: {
        church: true
      }
    });
    if (!baptism) {
      return res.status(404).json({ error: 'Baptism record not found' });
    }
    res.json(baptism);
  } catch (error) {
    res.status(400).json({ error: 'Failed to fetch baptism record' });
  }
});

// Update a baptism record
router.put('/:id', upload.single('baptismCertificate'), async (req, res) => {
  try {
    // Get the file path if a file was uploaded
    const baptismCertificate = req.file ? req.file.path : undefined;
    
    // Only include baptismCertificate in the update if a new file was uploaded
    const dataToUpdate = baptismCertificate 
      ? { ...req.body, baptismCertificate } 
      : req.body;
    
    // Handle date fields if they exist in the request
    if (dataToUpdate.birthDate) {
      dataToUpdate.birthDate = moment(dataToUpdate.birthDate).toDate();
    }
    if (dataToUpdate.baptismDate) {
      dataToUpdate.baptismDate = moment(dataToUpdate.baptismDate).toDate();
    }
    if (dataToUpdate.baptismClassDate) {
      dataToUpdate.baptismClassDate = moment(dataToUpdate.baptismClassDate).toDate();
    }
    if (dataToUpdate.conversionDate) {
      dataToUpdate.conversionDate = moment(dataToUpdate.conversionDate).toDate();
    }
    
    const baptism = await prisma.baptism.update({
      where: { id: req.params.id },
      data: dataToUpdate
    });
    res.json(baptism);
  } catch (error) {
    console.error('Error updating baptism:', error);
    res.status(400).json({ error: 'Failed to update baptism record' });
  }
});

// Delete a baptism record
router.delete('/:id', async (req, res) => {
  try {
    await prisma.baptism.delete({
      where: { id: req.params.id }
    });
    res.json({ message: 'Baptism record deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete baptism record' });
  }
});

// Get baptism records by church ID
router.get('/church/:churchId', async (req, res) => {
  try {
    const baptisms = await prisma.baptism.findMany({
      where: { churchId: req.params.churchId },
      include: {
        church: true
      }
    });
    res.json(baptisms);
  } catch (error) {
    res.status(400).json({ error: 'Failed to fetch church baptism records' });
  }
});

// Get baptisms by date range
router.get('/date-range', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const baptisms = await prisma.baptism.findMany({
      where: {
        baptismDate: {
          gte: new Date(startDate as string),
          lte: new Date(endDate as string)
        }
      },
      include: {
        church: true
      }
    });
    res.json(baptisms);
  } catch (error) {
    res.status(400).json({ error: 'Failed to fetch baptisms by date range' });
  }
});

// Download baptism certificate
router.get('/:id/certificate', async (req, res) => {
  try {
    const { id } = req.params;
    
    const baptism = await prisma.baptism.findUnique({
      where: { id },
      select: { baptismCertificate: true, fullName: true }
    });

    if (!baptism || !baptism.baptismCertificate) {
      return res.status(404).json({ error: 'Baptism certificate not found' });
    }

    // Send the file
    res.download(baptism.baptismCertificate, `certificate-${baptism.fullName}.pdf`);
  } catch (error) {
    console.error('Error downloading baptism certificate:', error);
    res.status(500).json({ error: 'Failed to download baptism certificate' });
  }
});

export default router;