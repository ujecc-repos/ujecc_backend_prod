"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("../utils/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const lodash_1 = __importDefault(require("lodash"));
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (token === undefined) {
        return res.status(401).json({ error: 'Désolé, vous n\'avez pas accès' });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(`${token}`, JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (error) {
        res.status(400).json({ error: `clarens ${error}` });
    }
};
const router = express_1.default.Router();
const upload_1 = __importDefault(require("../utils/upload"));
// Create a new user with optional image upload
router.post('/', upload_1.default.single('profileImage'), async (req, res) => {
    try {
        const { firstname, lastname, civilState, password, birthDate, gender, joinDate, country, birthCountry, baptismDate, baptismLocation, mobilePhone, homePhone, facebook, email, addressLine, city, birthCity, profession, churchId, age, personToContact, spouseFullName, minister, role } = req.body;
        // Check if email already exists
        const existingUser = await client_1.prisma.user.findUnique({
            where: {
                email: email
            }
        });
        if (existingUser) {
            return res.status(400).json({ error: 'Désolé, cette adresse email existe déjà' });
        }
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash(password, salt);
        const userData = {
            firstname,
            lastname,
            plainPassword: password || "",
            password: hashedPassword || "",
            email: email || "",
            role: role || "Membre",
            personToContact: personToContact || "",
            minister: minister || "",
            spouseFullName: spouseFullName || "",
            etatCivil: civilState || "",
            birthDate: birthDate || "",
            sex: gender || "",
            joinDate: joinDate || "",
            country: country || "",
            birthCountry: birthCountry || "",
            baptismDate: baptismDate || "",
            baptismLocation: baptismLocation || "",
            mobilePhone: mobilePhone || "",
            homePhone: homePhone || "",
            facebook: facebook || "",
            city: city || "",
            age: age || "",
            birthCity: birthCity || "",
            profession: profession || "",
            addressLine: addressLine || "",
            // Add profile picture path if an image was uploaded
            picture: req.file ? `/uploads/${req.file.filename}` : undefined
        };
        let user;
        if (churchId) {
            // Si churchId est fourni, utiliser connect
            user = await client_1.prisma.user.create({
                data: { ...userData, church: { connect: { id: churchId } } }
            });
        }
        else {
            // Si churchId n'est pas fourni, ne pas utiliser connect
            user = await client_1.prisma.user.create({
                data: userData
            });
        }
        res.json(user);
    }
    catch (error) {
        console.log("error : ", error);
        res.status(400).json({ error: `${error}` });
    }
});
router.put("/logout", async (req, res) => {
    try {
        res.status(200).json({ message: 'Deconnexion réussie' });
    }
    catch (error) {
        res.status(400).json({ error: `${error}` });
    }
});
// Login route
router.post('/login', async (req, res) => {
    try {
        console.log("req.body : ", req.body);
        const user = await client_1.prisma.user.findUnique({
            where: { email: req.body.email },
            select: {
                id: true,
                email: true,
                role: true,
                password: true,
            }
        });
        if (!user) {
            return res.status(400).json({ message: 'Email ou mot de passe incorrect', state: "error" });
        }
        // Verify password
        // Handle case where password might be null
        if (!user.password) {
            return res.status(400).json({ message: 'Email ou mot de passe incorrect' });
        }
        const validPassword = await bcryptjs_1.default.compare(req.body.password, user.password);
        if (!validPassword) {
            return res.status(400).json({ message: 'Email ou mot de passe incorrect' });
        }
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
    }
    catch (error) {
        res.status(400).json({ error: `${error}` });
    }
});
// Get all users (protected route)
router.get('/allusers', async (req, res) => {
    try {
        const users = await client_1.prisma.user.findMany({
            include: {
                church: true,
                groups: true
            }
        });
        res.json(users);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to fetch users' });
    }
});
// Get only Directors and administrators
router.get('/directors/administrators', async (req, res) => {
    try {
        const users = await client_1.prisma.user.findMany({
            where: {
                role: {
                    in: ['Directeur']
                }
            },
            include: {
                church: true,
                groups: true
            }
        });
        res.json(users);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to fetch users' });
    }
});
// Change password endpoint
router.post('/change-password', verifyToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        // Validate input
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                message: 'Le mot de passe actuel et le nouveau mot de passe sont requis',
                state: "error"
            });
        }
        // Get user with password
        const user = await client_1.prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                password: true
            }
        });
        if (!user) {
            return res.status(404).json({
                message: 'Utilisateur non trouvé',
                state: "error"
            });
        }
        // Verify current password
        if (!user.password) {
            return res.status(400).json({
                message: 'Impossible de vérifier le mot de passe actuel',
                state: "error"
            });
        }
        const validPassword = await bcryptjs_1.default.compare(currentPassword, user.password);
        if (!validPassword) {
            return res.status(400).json({
                message: 'Le mot de passe actuel est incorrect',
                state: "error"
            });
        }
        // Hash new password
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, salt);
        // Update password
        await client_1.prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                plainPassword: newPassword // Store plain password for reference if needed
            }
        });
        res.status(200).json({
            message: 'Mot de passe modifié avec succès',
            state: "success"
        });
    }
    catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({
            message: 'Une erreur est survenue lors du changement de mot de passe',
            state: "error"
        });
    }
});
// Get a single user by ID (protected route)
router.get('/:id', async (req, res) => {
    try {
        const user = await client_1.prisma.user.findUnique({
            where: { id: `${req.params.id}` },
            include: {
                church: {
                    include: { pasteur: true }
                },
                groups: true,
            }
        });
        if (!user) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }
        res.json(user);
    }
    catch (error) {
        res.status(400).json({ error: 'Impossible de récupérer l\'utilisateur' });
    }
});
router.get('/userbytoken/token', verifyToken, async (req, res) => {
    try {
        const user = await client_1.prisma.user.findUnique({
            where: { id: `${req.user.id}` },
            include: {
                church: true,
                groups: true
            }
        });
        if (!user) {
            return res.status(404).json({ error: 'L\'Utilisateur n\'es pas trouvé' });
        }
        res.json(user);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to fetch user' });
    }
});
// Update a user with optional image upload
router.put('/:id', upload_1.default.single('profileImage'), async (req, res) => {
    console.log("user : ", req.body);
    try {
        // Extract data from request body
        const userData = req.body;
        console.log("user body : ", req.body);
        // If a file was uploaded, add the file path to the user data
        if (req.file) {
            userData.picture = `/uploads/${req.file.filename}`;
        }
        // Remove fields that shouldn't be updated or cause conflicts
        const fieldsToOmit = ['id', 'createdAt', 'updatedAt', 'civilState'];
        const cleanedData = lodash_1.default.omit(userData, fieldsToOmit);
        // Handle civilState mapping
        if (userData.civilState) {
            cleanedData.etatCivil = userData.civilState;
        }
        // Handle password updates carefully
        if (cleanedData.password && cleanedData.password.trim() !== '') {
            // Hash the new password
            const salt = await bcryptjs_1.default.genSalt(10);
            cleanedData.password = await bcryptjs_1.default.hash(cleanedData.password, salt);
            cleanedData.plainPassword = userData.password; // Store plain password for reference
        }
        else {
            // Remove password fields if not updating password
            delete cleanedData.password;
            delete cleanedData.plainPassword;
        }
        // Convert string values to appropriate types and handle empty strings
        Object.keys(cleanedData).forEach(key => {
            if (cleanedData[key] === '' || cleanedData[key] === 'undefined' || cleanedData[key] === 'null') {
                cleanedData[key] = null;
            }
            // Convert age to string if it's a number
            if (key === 'age' && typeof cleanedData[key] === 'number') {
                cleanedData[key] = cleanedData[key].toString();
            }
        });
        console.log("cleaned data : ", cleanedData);
        const user = await client_1.prisma.user.update({
            where: { id: req.params.id },
            data: cleanedData,
            include: {
                church: true,
                groups: true
            }
        });
        res.json(user);
    }
    catch (error) {
        console.log("error : ", error);
        // Provide more specific error messages
        if (error.code === 'P2002') {
            res.status(400).json({ error: 'Cette adresse email ou ce mot de passe est déjà utilisé par un autre utilisateur.' });
        }
        else if (error.code === 'P2025') {
            res.status(404).json({ error: 'Utilisateur non trouvé.' });
        }
        else {
            res.status(400).json({ error: 'Erreur lors de la mise à jour de l\'utilisateur: ' + (error.message || error) });
        }
    }
});
// Delete a user
router.delete('/:id', async (req, res) => {
    try {
        await client_1.prisma.user.delete({
            where: { id: req.params.id }
        });
        res.json({ message: 'Utilisateur supprimé avec succès' });
    }
    catch (error) {
        res.status(400).json({ error: 'Impossible de supprimer l\'utilisateur' });
    }
});
router.put('/changeuser/role/:id', async (req, res) => {
    try {
        const user = await client_1.prisma.user.update({
            where: { id: req.params.id },
            data: { role: req.body.role }
        });
        res.json(user);
    }
    catch (error) {
        res.status(400).json({ error: 'Impossible de changer le rôle de l\'utilisateur' });
    }
});
// Get users by church ID
router.get('/church/:churchId', async (req, res) => {
    try {
        const users = await client_1.prisma.user.findMany({
            where: { churchId: req.params.churchId },
            include: {
                church: true,
                groups: true
            }
        });
        console.log("users : ", users);
        res.json(users);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to fetch church users' });
    }
});
// Get users with upcoming birthdays
router.get('/birthdays/upcoming/:churchId', async (req, res) => {
    try {
        // Get query parameter for days ahead (default to 30 days)
        const daysAhead = parseInt(req.query.days) || 30;
        // Get all users with birthDate
        const users = await client_1.prisma.user.findMany({
            where: {
                AND: [
                    {
                        churchId: req.params.churchId
                    },
                    {
                        birthDate: {
                            not: null
                        }
                    },
                    {
                        birthDate: {
                            not: ""
                        }
                    },
                ]
            },
            include: {
                church: true,
                groups: true
            }
        });
        // Filter users with upcoming birthdays
        const usersWithUpcomingBirthdays = users.filter(user => {
            if (!user.birthDate)
                return false;
            try {
                // Parse the birthDate string (assuming format like "YYYY-MM-DD" or "MM/DD/YYYY")
                let birthDate;
                // Try different date formats
                if (user.birthDate.includes('-')) {
                    // Format: YYYY-MM-DD or DD-MM-YYYY
                    const parts = user.birthDate.split('-');
                    if (parts[0].length === 4) {
                        // YYYY-MM-DD
                        birthDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
                    }
                    else {
                        // DD-MM-YYYY
                        birthDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
                    }
                }
                else if (user.birthDate.includes('/')) {
                    // Format: MM/DD/YYYY or DD/MM/YYYY
                    const parts = user.birthDate.split('/');
                    // Assuming MM/DD/YYYY format
                    birthDate = new Date(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]));
                }
                else {
                    // Try direct parsing
                    birthDate = new Date(user.birthDate);
                }
                if (isNaN(birthDate.getTime())) {
                    return false; // Invalid date
                }
                // Get current date and calculate upcoming birthday
                const today = new Date();
                const currentYear = today.getFullYear();
                // Create this year's birthday
                let thisYearBirthday = new Date(currentYear, birthDate.getMonth(), birthDate.getDate());
                // If this year's birthday has passed, check next year's birthday
                if (thisYearBirthday < today) {
                    thisYearBirthday = new Date(currentYear + 1, birthDate.getMonth(), birthDate.getDate());
                }
                // Calculate days until birthday
                const timeDiff = thisYearBirthday.getTime() - today.getTime();
                const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
                return daysDiff >= 0 && daysDiff <= daysAhead;
            }
            catch (error) {
                console.error(`Error parsing birthDate for user ${user.id}:`, error);
                return false;
            }
        });
        // Sort by upcoming birthday date
        usersWithUpcomingBirthdays.sort((a, b) => {
            const today = new Date();
            const currentYear = today.getFullYear();
            const getBirthdayThisYear = (dateStr) => {
                try {
                    let birthDate;
                    if (dateStr.includes('-')) {
                        const parts = dateStr.split('-');
                        if (parts[0].length === 4) {
                            birthDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
                        }
                        else {
                            birthDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
                        }
                    }
                    else if (dateStr.includes('/')) {
                        const parts = dateStr.split('/');
                        birthDate = new Date(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]));
                    }
                    else {
                        birthDate = new Date(dateStr);
                    }
                    let thisYearBirthday = new Date(currentYear, birthDate.getMonth(), birthDate.getDate());
                    if (thisYearBirthday < today) {
                        thisYearBirthday = new Date(currentYear + 1, birthDate.getMonth(), birthDate.getDate());
                    }
                    return thisYearBirthday;
                }
                catch {
                    return new Date(9999, 11, 31); // Far future date for invalid dates
                }
            };
            const aBirthday = getBirthdayThisYear(a.birthDate);
            const bBirthday = getBirthdayThisYear(b.birthDate);
            return aBirthday.getTime() - bBirthday.getTime();
        });
        // Add calculated birthday info to response
        const usersWithBirthdayInfo = usersWithUpcomingBirthdays.map(user => {
            const today = new Date();
            const currentYear = today.getFullYear();
            try {
                let birthDate;
                if (user.birthDate.includes('-')) {
                    const parts = user.birthDate.split('-');
                    if (parts[0].length === 4) {
                        birthDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
                    }
                    else {
                        birthDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
                    }
                }
                else if (user.birthDate.includes('/')) {
                    const parts = user.birthDate.split('/');
                    birthDate = new Date(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]));
                }
                else {
                    birthDate = new Date(user.birthDate);
                }
                let thisYearBirthday = new Date(currentYear, birthDate.getMonth(), birthDate.getDate());
                if (thisYearBirthday < today) {
                    thisYearBirthday = new Date(currentYear + 1, birthDate.getMonth(), birthDate.getDate());
                }
                const timeDiff = thisYearBirthday.getTime() - today.getTime();
                const daysUntilBirthday = Math.ceil(timeDiff / (1000 * 3600 * 24));
                return {
                    ...user,
                    daysUntilBirthday,
                    upcomingBirthdayDate: thisYearBirthday.toISOString().split('T')[0]
                };
            }
            catch {
                return {
                    ...user,
                    daysUntilBirthday: 999,
                    upcomingBirthdayDate: null
                };
            }
        });
        res.json({
            count: usersWithBirthdayInfo.length,
            users: usersWithBirthdayInfo
        });
    }
    catch (error) {
        res.status(400).json({ error: 'Impossible de récupérer les anniversaires à venir' });
    }
});
exports.default = router;
