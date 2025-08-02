import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { prisma } from "./utils/client"

// Import routes
import churchRoutes from './routes/church.routes';
import userRoutes from './routes/user.routes';
import groupsRoutes from './routes/groups.routes';
import eventRoutes from './routes/event.routes';
import baptismRoutes from './routes/baptism.routes';
import deathRoutes from  './routes/death.routes'
import funeralRoutes from './routes/funeral.routes';
import presentationRoutes from "./routes/presentation.routes"
import MariageRoutes from './routes/mariage.routes';
import comiteeRoutes from './routes/comitee.routes'
import appointmentRoutes from './routes/appointment.routes'
import expenseRoutes from './routes/expense.routes'
import moissonRoutes from './routes/moisson.routes'
import offeringRoutes from './routes/offering.routes'
import tithingRoutes from './routes/tithing.routes'
import donationRoutes from './routes/donation.routes'
import transferRoutes from './routes/transfer.routes'
import missionRoutes from './routes/mission.routes'
import ministryRoutes from './routes/ministry.routes'
import sanctionRoutes from './routes/sanction.routes'
import pasteurRoutes from './routes/pasteur.routes'
import statsRoutes from './routes/stats.routes'

// Initialize environment variables
dotenv.config();

// Create Express application
const app = express();

// Middleware
app.use(cors({
  origin: ["http://ecclesys.ujecc.org","http://ecclesys.ujecc.org"]
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Basic error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
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
app.use('/api/churches', churchRoutes);
app.use('/api/users', userRoutes);
app.use('/api/groups', groupsRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/baptisms', baptismRoutes);
app.use('/api/funerals', funeralRoutes);
app.use('/api/death', deathRoutes)
app.use('/api/presentations', presentationRoutes)
app.use('/api/mariages', MariageRoutes)
app.use('/api/committees', comiteeRoutes)
app.use('/api/appointments', appointmentRoutes)
app.use('/api/expenses', expenseRoutes)
app.use('/api/moissons', moissonRoutes)
app.use('/api/offerings', offeringRoutes)
app.use('/api/tithings', tithingRoutes)
app.use('/api/donations', donationRoutes)
app.use('/api/transfers', transferRoutes)
app.use('/api/missions', missionRoutes)
app.use('/api/ministries', ministryRoutes)
app.use('/api/sanctions', sanctionRoutes)
app.use('/api/pasteurs', pasteurRoutes)
app.use('/api/stats', statsRoutes)

// Import Sunday Class routes
import sundayClassRoutes from './routes/sundayClass.routes';
// Register Sunday Class routes
app.use('/api/sunday-classes', sundayClassRoutes)

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
})

export default app;