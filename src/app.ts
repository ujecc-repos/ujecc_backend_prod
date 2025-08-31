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
import presenceRoutes from "./routes/presence.route"
import serviceRoutes from "./routes/service.routes"

// Initialize environment variables
dotenv.config();

// Create Express application
const app = express();

// Middleware
app.use(cors({
  origin: "*"
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// let us

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
app.get('/api/departement/:departementName', async (req, res) => {
  try {
    const departement = await prisma.departement.findUnique({
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
 const result: Record<string, string[]> = {};

  departement?.commune.forEach(commune => {
    result[commune.name] = commune.sectionCommunale.map(section => section.name);
  });

  res.json(result)

  } catch (error) {
    throw new Error(`error : ${error}`)
  }
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
app.use('/api/presences', presenceRoutes)
app.use('/api/services', serviceRoutes)

// Import Sunday Class routes
import sundayClassRoutes from './routes/sundayClass.routes';
// Register Sunday Class routes
app.use('/api/sunday-classes', sundayClassRoutes)

export const SudEst: { [commune: string]: string[] } = {
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
  const departement = await prisma.departement.upsert({
    where: { name: "Sud-Est" },
    update: {},
    create: { name: "Sud-Est" },
  });

  // Loop through Communes
  for (const [communeName, localities] of Object.entries(SudEst)) {
    const commune = await prisma.commune.upsert({
      where: { name: communeName },
      update: {},
      create: {
        name: communeName,
        departementId: departement.id,
      },
    });

    // Now insert Section Communales under this Commune
    for (const localityName of localities) {
      await prisma.sectionCommunale.upsert({
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
  } catch (error) {
    console.log("error : ", error)
    res.status(500).json({ error: error });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
})

export default app;