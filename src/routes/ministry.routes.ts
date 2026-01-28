import express from 'express';
import { prisma } from '../utils/client';
import __ from "lodash";

interface IMinistry {
  name: string;
  description: string;
  churchId?: string;
}

const router = express.Router();

// Create a new ministry
router.post('/', async (req, res) => {
  try {
    const ministryData = req.body as IMinistry;

    const ministry = await prisma.ministry.create({
      data: ministryData
    });
    res.json(ministry);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create ministry' });
  }
});

// Get all ministries
router.get('/', async (req, res) => {
  try {
    const ministries = await prisma.ministry.findMany({
      include: {
        church: true
      }
    });
    res.json(ministries);
  } catch (error) {
    res.status(400).json({ error: 'Failed to fetch ministries' });
  }
});

// Get a single ministry by ID
router.get('/:id', async (req, res) => {
  try {
    const ministry = await prisma.ministry.findUnique({
      where: { id: req.params.id },
      include: {
        church: true
      }
    });
    if (!ministry) {
      return res.status(404).json({ error: 'Ministry not found' });
    }
    res.json(ministry);
  } catch (error) {
    res.status(400).json({ error: 'Failed to fetch ministry' });
  }
});

// Update a ministry
router.put('/:id', async (req, res) => {
  try {
    const ministry = await prisma.ministry.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(ministry);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update ministry' });
  }
});

// Delete a ministry
router.delete('/:id', async (req, res) => {
  try {
    await prisma.ministry.delete({
      where: { id: req.params.id }
    });
    res.json({ message: 'Ministry deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete ministry' });
  }
});

// Get ministries by church ID
router.get('/church/:churchId', async (req, res) => {
  try {
    const ministries = await prisma.ministry.findMany({
      where: { churchId: req.params.churchId },
      include: {
        church: true
      }
    });
    res.json(ministries);
  } catch (error) {
    res.status(400).json({ error: 'Failed to fetch ministries for this church' });
  }
});

// Assign a user to a ministry
router.post('/:id/assign-user', async (req, res) => {
  try {
    const { userId } = req.body;
    const ministryId = req.params.id;
    console.log("userId", userId);
    console.log("ministryId", ministryId);

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Verify ministry exists
    const ministry = await prisma.ministry.findUnique({
      where: { id: ministryId }
    });

    if (!ministry) {
      return res.status(404).json({ error: 'Ministry not found' });
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('Assigning user', user.firstname, user.lastname, 'to ministry', ministry.name);

    // Update user's ministryId
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ministry: { connect: { id: ministryId } }
      },
      include: {
        ministry: true,
        church: true
      }
    });

    console.log('User successfully assigned to ministry');
    res.json({
      message: 'User assigned to ministry successfully',
      user: updatedUser
    });
  } catch (error: any) {
    console.error('Error assigning user to ministry:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    res.status(400).json({
      error: 'Failed to assign user to ministry',
      details: error.message
    });
  }
});

export default router;