"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SudEst = void 0;
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const client_1 = require("./utils/client");
// Import routes
const church_routes_1 = __importDefault(require("./routes/church.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const groups_routes_1 = __importDefault(require("./routes/groups.routes"));
const event_routes_1 = __importDefault(require("./routes/event.routes"));
const baptism_routes_1 = __importDefault(require("./routes/baptism.routes"));
const death_routes_1 = __importDefault(require("./routes/death.routes"));
const funeral_routes_1 = __importDefault(require("./routes/funeral.routes"));
const presentation_routes_1 = __importDefault(require("./routes/presentation.routes"));
const mariage_routes_1 = __importDefault(require("./routes/mariage.routes"));
const comitee_routes_1 = __importDefault(require("./routes/comitee.routes"));
const appointment_routes_1 = __importDefault(require("./routes/appointment.routes"));
const expense_routes_1 = __importDefault(require("./routes/expense.routes"));
const moisson_routes_1 = __importDefault(require("./routes/moisson.routes"));
const offering_routes_1 = __importDefault(require("./routes/offering.routes"));
const tithing_routes_1 = __importDefault(require("./routes/tithing.routes"));
const donation_routes_1 = __importDefault(require("./routes/donation.routes"));
const transfer_routes_1 = __importDefault(require("./routes/transfer.routes"));
const mission_routes_1 = __importDefault(require("./routes/mission.routes"));
const ministry_routes_1 = __importDefault(require("./routes/ministry.routes"));
const sanction_routes_1 = __importDefault(require("./routes/sanction.routes"));
const pasteur_routes_1 = __importDefault(require("./routes/pasteur.routes"));
const stats_routes_1 = __importDefault(require("./routes/stats.routes"));
const presence_route_1 = __importDefault(require("./routes/presence.route"));
const service_routes_1 = __importDefault(require("./routes/service.routes"));
// Initialize environment variables
dotenv_1.default.config();
// Create Express application
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)({
    origin: ["http://ecclesys.ujecc.org", "https://ecclesys.ujecc.org", "http://localhost:5173"]
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// let us
// Serve static files from uploads directory
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// Basic error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        status: 'error',
        message: 'Something went wrong!'
    });
});
// Health check endpoint
app.get('/api/departement/:departementName', async (req, res) => {
    try {
        const departement = await client_1.prisma.departement.findUnique({
            where: { name: req.params.departementName },
            include: {
                commune: {
                    include: {
                        sectionCommunale: true,
                    },
                },
            },
        });
        if (!departement) {
            throw new Error(`Departement with name Artibonite not found`);
        }
        // Map into { [communeName]: string[] }
        const result = {};
        departement?.commune.forEach(commune => {
            result[commune.name] = commune.sectionCommunale.map(section => section.name);
        });
        res.json(result);
    }
    catch (error) {
        throw new Error(`error : ${error}`);
    }
});
// Register routes
app.use('/api/churches', church_routes_1.default);
app.use('/api/users', user_routes_1.default);
app.use('/api/groups', groups_routes_1.default);
app.use('/api/events', event_routes_1.default);
app.use('/api/baptisms', baptism_routes_1.default);
app.use('/api/funerals', funeral_routes_1.default);
app.use('/api/death', death_routes_1.default);
app.use('/api/presentations', presentation_routes_1.default);
app.use('/api/mariages', mariage_routes_1.default);
app.use('/api/committees', comitee_routes_1.default);
app.use('/api/appointments', appointment_routes_1.default);
app.use('/api/expenses', expense_routes_1.default);
app.use('/api/moissons', moisson_routes_1.default);
app.use('/api/offerings', offering_routes_1.default);
app.use('/api/tithings', tithing_routes_1.default);
app.use('/api/donations', donation_routes_1.default);
app.use('/api/transfers', transfer_routes_1.default);
app.use('/api/missions', mission_routes_1.default);
app.use('/api/ministries', ministry_routes_1.default);
app.use('/api/sanctions', sanction_routes_1.default);
app.use('/api/pasteurs', pasteur_routes_1.default);
app.use('/api/stats', stats_routes_1.default);
app.use('/api/presences', presence_route_1.default);
app.use('/api/services', service_routes_1.default);
// Import Sunday Class routes
const sundayClass_routes_1 = __importDefault(require("./routes/sundayClass.routes"));
// Register Sunday Class routes
app.use('/api/sunday-classes', sundayClass_routes_1.default);
exports.SudEst = {
    "Anse à Pitre": ["Boucan Guillaume", "Bois d'Orme"],
    "Bainet": [
        "Bas de Grandou",
        "Brésilienne",
        "Trou Mahot",
        "Haut Grandou",
        "Bas de Lacroix",
        "Bras Gauche",
        "Oranger",
        "Bas des Gris Gris",
    ],
    "Belle Anse": [
        "Mapou",
        "Bel Air",
        "Baie d'Orange",
        "Mabriole",
        "Callumette",
        "Corail Lamothe",
        "Pichon",
    ],
    "Cayes Jacmel": ["Gaillard", "Ravine Normande", "Haut Cap Rouge"],
    "Côtes de Fer": [
        "Jamais Vu",
        "Gris Gris",
        "Labiche",
        "Bras Gauche",
        "Amazones",
        "Boucan Bélier",
    ],
    "Grand Gosier": ["Colline des Chaines"],
    "Jacmel": [
        "Quartier de Marbial",
        "Jacmel",
        "Ville de Jacmel",
        "Bas Cap-Rouge",
        "Sect. Bas Cap Rouge",
        "Sect. Fond Melon (Selle)",
        "Sect. Cochon Gras",
        "Sect. La Gosseline",
        "Sect. Marbial",
        "Sect. Montagne la Voute",
        "Sect. Grande Rivière de Jacmel",
        "Sect. Bas Coq Chante",
        "Sect. Haut Coq qui Chante",
        "Morne à Bruler",
        "Sect. La Vanneau",
        "Sect. La Montagne",
        "Fond Melon",
    ],
    "La Vallée": ["La Vallée", "La Vallée"],
    "Marigot": [
        "Fond Jean Noel",
        "Savane Dubois",
        "Corail Soult",
        "Grande Rivière Fesles",
        "Macary",
    ],
    "Thiotte": ["Thiotte", "Pot de Chambre"],
};
app.post('/api/communes', async (req, res) => {
    try {
        // Upsert the Departement
        const departement = await client_1.prisma.departement.upsert({
            where: { name: "Sud-Est" },
            update: {},
            create: { name: "Sud-Est" },
        });
        // Loop through Communes
        for (const [communeName, localities] of Object.entries(exports.SudEst)) {
            const commune = await client_1.prisma.commune.upsert({
                where: { name: communeName },
                update: {},
                create: {
                    name: communeName,
                    departementId: departement.id,
                },
            });
            // Now insert Section Communales under this Commune
            for (const localityName of localities) {
                await client_1.prisma.sectionCommunale.upsert({
                    where: { name: localityName },
                    update: {},
                    create: {
                        name: localityName,
                        communeId: commune.id,
                    },
                });
            }
        }
        console.log('All Communes and their Section Communales registered!');
        res.status(200).json({ message: 'All Communes and their Section Communales registered!' });
    }
    catch (error) {
        console.log("error : ", error);
        res.status(500).json({ error: error });
    }
});
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
exports.default = app;
