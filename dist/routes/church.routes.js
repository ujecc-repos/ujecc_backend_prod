"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("../utils/client");
const upload_1 = __importDefault(require("../utils/upload"));
const router = express_1.default.Router();
// Create a new church
router.post('/', async (req, res) => {
    const { name, commune, sectionCommunale, departement } = req.body;
    try {
        const isChurchExist = await client_1.prisma.church.findUnique({
            where: {
                name: name
            }
        });
        if (isChurchExist) {
            return res.status(400).json({ error: 'Désoler, cette église existe déja' });
        }
        // Prepare church data
        const churchData = {
            name,
            address: `${commune}, ${sectionCommunale}, ${departement}`
        };
        // Only connect to mission if one is provided
        if (req.body.mission) {
            churchData.mission = {
                connect: {
                    id: req.body.mission
                }
            };
        }
        const church = await client_1.prisma.church.create({
            data: churchData,
            select: {
                id: true,
                name: true,
                users: { select: { id: true, firstname: true, lastname: true, email: true } }
            },
        });
        // Generate JWT token
        // const token = jwt.sign(
        //     { id: church.users[0].id, email: church.users[0].email },
        //     JWT_SECRET,
        //     { expiresIn: '24h' }
        //   );
        res.json({ churchName: church.name });
    }
    catch (error) {
        console.log("error : ", error);
        res.status(400).json({ error: `${error}` });
    }
});
// Get all churches
router.get('/', async (req, res) => {
    try {
        const churches = await client_1.prisma.church.findMany({
            include: {
                users: true,
                groups: true,
                events: true,
                mariages: true,
                funerals: true,
                presentations: true,
                batism: true,
                death: true
            }
        });
        res.json(churches);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to fetch churches' });
    }
});
// Get a single church by ID
router.get('/:id', async (req, res) => {
    try {
        const church = await client_1.prisma.church.findUnique({
            where: { id: req.params.id },
            include: {
                users: true,
                groups: true,
                events: true,
                mariages: true,
                funerals: true,
                presentations: true,
                batism: true,
                death: true
            }
        });
        if (!church) {
            return res.status(404).json({ error: 'Church not found' });
        }
        res.json(church);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to fetch church' });
    }
});
// Update a church with optional image upload
router.put('/:id', upload_1.default.single('churchImage'), async (req, res) => {
    try {
        // Extract data from request body
        const churchData = req.body;
        // If a file was uploaded, add the file path to the church data
        if (req.file) {
            churchData.picture = `/uploads/${req.file.filename}`;
        }
        const church = await client_1.prisma.church.update({
            where: { id: req.params.id },
            data: churchData
        });
        res.json(church);
    }
    catch (error) {
        console.log("error : ", error);
        res.status(400).json({ error: error });
    }
});
// Delete a church
router.delete('/:id', async (req, res) => {
    try {
        await client_1.prisma.church.delete({
            where: { id: req.params.id }
        });
        res.json({ message: 'Church deleted successfully' });
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to delete church' });
    }
});
// Add a user to a church
router.post('/:churchId/add-user', async (req, res) => {
    try {
        const { churchId } = req.params;
        const { userId } = req.body;
        // Validate inputs
        if (!churchId || !userId) {
            return res.status(400).json({ error: 'Church ID and User ID are required' });
        }
        // Check if church exists
        const church = await client_1.prisma.church.findUnique({
            where: { id: churchId }
        });
        if (!church) {
            return res.status(404).json({ error: 'Church not found' });
        }
        // Check if user exists
        const user = await client_1.prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        // Update user to connect with the church
        const updatedUser = await client_1.prisma.user.update({
            where: { id: userId },
            data: {
                church: {
                    connect: { id: churchId }
                }
            },
            include: {
                church: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });
        res.status(200).json({
            message: 'User added to church successfully',
            user: {
                id: updatedUser.id,
                firstname: updatedUser.firstname,
                lastname: updatedUser.lastname,
                email: updatedUser.email
            },
            church: updatedUser.church
        });
    }
    catch (error) {
        console.log("error : ", error);
        res.status(400).json({ error: `${error}` });
    }
});
// Remove a user from a church
router.post('/:churchId/remove-user', async (req, res) => {
    try {
        const { userId } = req.body;
        // Validate inputs
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }
        // Check if user exists
        const user = await client_1.prisma.user.findUnique({
            where: { id: userId },
            include: {
                church: true
            }
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        if (!user.church) {
            return res.status(400).json({ error: 'User is not associated with any church' });
        }
        // Update user to disconnect from the church
        const updatedUser = await client_1.prisma.user.update({
            where: { id: userId },
            data: {
                church: {
                    disconnect: true
                }
            }
        });
        res.status(200).json({
            message: 'User removed from church successfully',
            user: {
                id: updatedUser.id,
                firstname: updatedUser.firstname,
                lastname: updatedUser.lastname,
                email: updatedUser.email
            }
        });
    }
    catch (error) {
        console.log("error : ", error);
        res.status(400).json({ error: `${error}` });
    }
});
exports.default = router;
