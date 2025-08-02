import express from 'express';
import { prisma } from '../utils/client';
import __ from "lodash"
import upload from '../utils/upload';

const router = express.Router();

router.post('/', upload.single('groupImage'), async (req, res) => {
    // Extract data from request body
    const userData: Record<string, any> = req.body;
    const {
        name, minister, description, meetingDay, meetingTime, churchId,
        meetingLocation, meetingFrequency, ageGroup, maxMembers
    } = userData;
    
  try {
    // If a file was uploaded, add the file path to the group data
    if (req.file) {
      userData.picture = `/uploads/${req.file.filename}`;  
    }
    
    const group = await prisma.groupe.create({
      data: {
        name,
        minister: minister || "",
        description: description || "",
        meetingDays: meetingDay || "",
        meetingTime: meetingTime || "",
        meetingLocation: meetingLocation || "",
        meetingFrequency: meetingFrequency || "",
        ageGroup: ageGroup || "",
        maxMembers: maxMembers || "",
        picture: userData.picture, // Add the picture field
        church: { connect: { id: churchId } }
      }
    });
    res.json(group);
  } catch (error) {
    res.status(400).json({ error: error });
  }
});

// Get all groups
router.get('/', async (req, res) => {
  try {
    const groups = await prisma.groupe.findMany({
      include: {
        church: true,
        users: true
      }
    });
    res.json(groups);
  } catch (error) {
    res.status(400).json({ error: 'Failed to fetch groups' });
  }
});

// Get a single group by ID
router.get('/:id', async (req, res) => {
  try {
    const group = await prisma.groupe.findUnique({
      where: { id: req.params.id },
      include: {
        church: true,
        users: true
      }
    });
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }
    res.json(group);
  } catch (error) {
    res.status(400).json({ error: 'Failed to fetch group' });
  }
});

// Update a group with optional image upload
router.put('/:id', upload.single('groupImage'), async (req, res) => {
  try {
    // Extract data from request body
    const groupData: Record<string, any> = req.body;
    
    // If a file was uploaded, add the file path to the group data
    if (req.file) {
      groupData.picture = `/uploads/${req.file.filename}`;
    }
    
    const group = await prisma.groupe.update({
      where: { id: req.params.id },
      data: {
        ...__.omit(groupData, ["id", "meetingDay"]), 
        meetingDays: groupData.meetingDay || "",
        picture: req.file ? `/uploads/${req.file.filename}` : undefined
      }
    });
    res.json(group);
  } catch (error) {
    res.status(400).json({ error: error });
  }
});

// Delete a group
router.delete('/:id', async (req, res) => {
  try {
    await prisma.groupe.delete({
      where: { id: req.params.id }
    });
    res.json({ message: 'Group deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete group' });
  }
});

// Get groups by church ID
router.get('/church/:churchId', async (req, res) => {
  try {
    const groups = await prisma.groupe.findMany({
      where: { churchId: req.params.churchId },
      include: {
        church: true,
        users: true
      }
    });
    res.json(groups);
  } catch (error) {
    res.status(400).json({ error: 'Failed to fetch church groups' });
  }
});

// Add user to group
router.post('/:id/users', async (req, res) => {
  try {
    // Check if we're adding a single user or multiple users
    if (req.body.userId) {
      // Single user case
      const group = await prisma.groupe.update({
        where: { id: req.params.id },
        data: {
          users: {
            connect: { id: req.body.userId }
          }
        },
        include: {
          users: true
        }
      });
      res.json(group);
    } else if (req.body.users && Array.isArray(req.body.users)) {
      // Multiple users case
      const userConnections = req.body.users.map((userId: string) => ({ id: userId }));
      
      const group = await prisma.groupe.update({
        where: { id: req.params.id },
        data: {
          users: {
            connect: userConnections
          }
        },
        include: {
          users: true
        }
      });
      res.json(group);
    } else {
      res.status(400).json({ error: 'Invalid request. Provide userId or users array.' });
    }
  } catch (error) {
    console.error('Error adding user(s) to group:', error);
    res.status(400).json({ error: 'Failed to add user(s) to group' });
  }
});

// Remove user from group
router.delete('/:id/users/:userId', async (req, res) => {
  try {
    const group = await prisma.groupe.update({
      where: { id: req.params.id },
      data: {
        users: {
          disconnect: { id: req.params.userId }
        }
      }
    });
    res.json(group);
  } catch (error) {
    res.status(400).json({ error: 'Failed to remove user from group' });
  }
});

// Transfer user from one group to another
router.post('/:sourceGroupId/transfer/:userId', async (req, res) => {
  try {
    const { sourceGroupId, userId } = req.params;
    const { targetGroupId } = req.body;
    
    if (!targetGroupId) {
      return res.status(400).json({ error: 'Target group ID is required' });
    }
    
    // Start a transaction to ensure both operations succeed or fail together
    const result = await prisma.$transaction(async (prisma) => {
      // Remove user from source group
      await prisma.groupe.update({
        where: { id: sourceGroupId },
        data: {
          users: {
            disconnect: { id: userId }
          }
        }
      });
      
      // Add user to target group
      const updatedTargetGroup = await prisma.groupe.update({
        where: { id: targetGroupId },
        data: {
          users: {
            connect: { id: userId }
          }
        },
        include: {
          users: true
        }
      });
      
      return updatedTargetGroup;
    });
    
    res.json({
      message: 'User transferred successfully',
      targetGroup: result
    });
  } catch (error) {
    console.error('Error transferring user:', error);
    res.status(400).json({ error: 'Failed to transfer user between groups' });
  }
});

export default router;