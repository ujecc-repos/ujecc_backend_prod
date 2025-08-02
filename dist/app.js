"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
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
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
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
// Import Sunday Class routes
const sundayClass_routes_1 = __importDefault(require("./routes/sundayClass.routes"));
// Register Sunday Class routes
app.use('/api/sunday-classes', sundayClass_routes_1.default);
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
exports.default = app;
