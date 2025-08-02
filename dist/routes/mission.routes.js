"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../generated/prisma");
const router = (0, express_1.Router)();
const prisma = new prisma_1.PrismaClient();
// Create a mission
router.post('/', async (req, res) => {
    try {
        const { missionName, description, status, location, presidentName } = req.body;
        // Vérifier si une mission avec le même nom existe déjà
        const existingMission = await prisma.mission.findFirst({
            where: {
                missionName: {
                    equals: missionName,
                }
            },
        });
        if (existingMission) {
            console.log("cette mission existe déja");
            return res.status(409).json({ error: 'Cette mission existe déjà. Veuillez choisir un autre nom.' });
        }
        const newMission = await prisma.mission.create({
            data: {
                missionName,
                description,
                status,
                location,
                presidentName: presidentName.toLowerCase().trim().replace(/\s+/g, "")
            },
        });
        res.status(201).json(newMission);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la création de la mission.' });
    }
});
// Get all missions
router.get('/', async (req, res) => {
    try {
        const missions = await prisma.mission.findMany({
            include: {
                church: true, // include churches
            },
        });
        res.status(200).json(missions);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors du chargement des missions.' });
    }
});
// Get mission by president name and calculate church statistics
router.get('/president/:presidentName', async (req, res) => {
    const { presidentName } = req.params;
    const year = req.query.year ? parseInt(req.query.year) : new Date().getFullYear();
    console.log("presidentName : ", presidentName);
    try {
        const mission = await prisma.mission.findFirst({
            where: {
                presidentName: {
                    contains: presidentName.toLowerCase().trim(),
                    // mode: 'insensitive'
                }
            },
            include: {
                church: {
                    include: {
                        users: true,
                        batism: true,
                        mariages: true,
                        funerals: true,
                        death: true,
                        pasteur: true
                    }
                }
            },
        });
        if (!mission) {
            return res.status(404).json({ error: 'Aucune mission trouvée pour ce président.' });
        }
        // Create date range for the specified year
        const startDate = new Date(year, 0, 1); // January 1st of the year
        const endDate = new Date(year, 11, 31, 23, 59, 59, 999); // December 31st of the year (end of day)
        // Calculate detailed statistics for each church in the mission
        const churchesWithStats = await Promise.all(mission.church.map(async (church) => {
            // Financial statistics
            const totalTithing = await prisma.tithing.aggregate({
                where: {
                    churchId: church.id,
                    date: {
                        gte: startDate,
                        lte: endDate
                    }
                },
                _sum: {
                    amount: true
                }
            });
            const totalDonations = await prisma.donation.aggregate({
                where: {
                    churchId: church.id,
                    date: {
                        gte: startDate,
                        lte: endDate
                    }
                },
                _sum: {
                    amount: true
                }
            });
            const totalOfferings = await prisma.offering.aggregate({
                where: {
                    churchId: church.id,
                    date: {
                        gte: startDate,
                        lte: endDate
                    }
                },
                _sum: {
                    amount: true
                }
            });
            const totalMoissons = await prisma.moisson.aggregate({
                where: {
                    churchId: church.id,
                    date: {
                        gte: startDate,
                        lte: endDate
                    }
                },
                _sum: {
                    amount: true
                }
            });
            const totalExpenses = await prisma.expense.aggregate({
                where: {
                    churchId: church.id,
                    date: {
                        gte: startDate,
                        lte: endDate
                    }
                },
                _sum: {
                    amount: true
                }
            });
            // Calculate total revenue
            const totalRevenue = ((totalTithing._sum.amount || 0) +
                (totalDonations._sum.amount || 0) +
                (totalOfferings._sum.amount || 0) +
                (totalMoissons._sum.amount || 0));
            // Count baptisms for the year
            const baptismsThisYear = church.batism.filter(baptism => {
                const baptismDate = new Date(baptism.baptismDate);
                return baptismDate >= startDate && baptismDate <= endDate;
            }).length;
            // Count marriages for the year
            const marriagesThisYear = church.mariages.filter(marriage => {
                const weddingDate = new Date(marriage.weddingDate);
                return weddingDate >= startDate && weddingDate <= endDate;
            }).length;
            // Count funerals for the year
            const funeralsThisYear = church.funerals.filter(funeral => {
                const funeralDate = new Date(funeral.funeralDate);
                return funeralDate >= startDate && funeralDate <= endDate;
            }).length;
            // Count deaths for the year
            const deathsThisYear = church.death.filter(death => {
                const deathDate = new Date(death.deathDate);
                return deathDate >= startDate && deathDate <= endDate;
            }).length;
            // Comprehensive statistics
            // Count transfers for the church within the year
            const transfersIn = await prisma.transfert.count({
                where: {
                    toChurchId: church.id,
                    createdAt: {
                        gte: startDate,
                        lte: endDate
                    }
                }
            });
            const transfersOut = await prisma.transfert.count({
                where: {
                    fromChurchId: church.id,
                    createdAt: {
                        gte: startDate,
                        lte: endDate
                    }
                }
            });
            const totalTransfers = transfersIn + transfersOut;
            const stats = {
                membership: {
                    totalMembers: church.users.length,
                    activeMembers: church.users.filter(user => user.membreActif).length,
                    inactiveMembers: church.users.filter(user => !user.membreActif).length,
                    maleMembers: church.users.filter(user => user.sex === 'Masculin').length,
                    femaleMembers: church.users.filter(user => user.sex === 'Féminin').length
                },
                sacraments: {
                    baptismsTotal: church.batism.length,
                    baptismsThisYear,
                    marriagesTotal: church.mariages.length,
                    marriagesThisYear,
                    funeralsTotal: church.funerals.length,
                    funeralsThisYear,
                    deathsTotal: church.death.length,
                    deathsThisYear
                },
                transfers: {
                    total: totalTransfers,
                    incoming: transfersIn,
                    outgoing: transfersOut
                },
                leadership: {
                    totalPastors: church.pasteur.length,
                    activePastors: church.pasteur.filter(pastor => pastor.status === 'Actif').length
                },
                finances: {
                    totalRevenue,
                    totalExpenses: totalExpenses._sum.amount || 0,
                    netIncome: totalRevenue - (totalExpenses._sum.amount || 0),
                    revenueBreakdown: {
                        tithing: totalTithing._sum.amount || 0,
                        donations: totalDonations._sum.amount || 0,
                        offerings: totalOfferings._sum.amount || 0,
                        moissons: totalMoissons._sum.amount || 0
                    }
                }
            };
            // Return church with detailed statistics
            return {
                id: church.id,
                name: church.name,
                address: church.address,
                phone: church.phone,
                picture: church.picture,
                statistics: stats
            };
        }));
        // Calculate mission-level statistics
        const missionStats = {
            totalChurches: mission.church.length,
            totalMembers: churchesWithStats.reduce((sum, church) => sum + church.statistics.membership.totalMembers, 0),
            totalPastors: churchesWithStats.reduce((sum, church) => sum + church.statistics.leadership.totalPastors, 0),
            totalBaptisms: churchesWithStats.reduce((sum, church) => sum + church.statistics.sacraments.baptismsTotal, 0),
            baptismsThisYear: churchesWithStats.reduce((sum, church) => sum + church.statistics.sacraments.baptismsThisYear, 0),
            totalFunerals: churchesWithStats.reduce((sum, church) => sum + church.statistics.sacraments.funeralsTotal, 0),
            funeralsThisYear: churchesWithStats.reduce((sum, church) => sum + church.statistics.sacraments.funeralsThisYear, 0),
            totalTransfers: churchesWithStats.reduce((sum, church) => sum + church.statistics.transfers.total, 0),
            transfersIn: churchesWithStats.reduce((sum, church) => sum + church.statistics.transfers.incoming, 0),
            transfersOut: churchesWithStats.reduce((sum, church) => sum + church.statistics.transfers.outgoing, 0),
            totalRevenue: churchesWithStats.reduce((sum, church) => sum + church.statistics.finances.totalRevenue, 0),
            totalExpenses: churchesWithStats.reduce((sum, church) => sum + church.statistics.finances.totalExpenses, 0),
            netIncome: churchesWithStats.reduce((sum, church) => sum + church.statistics.finances.netIncome, 0)
        };
        // Return mission with enhanced church statistics
        res.status(200).json({
            id: mission.id,
            missionName: mission.missionName,
            description: mission.description,
            status: mission.status,
            location: mission.location,
            createdAt: mission.createdAt,
            updatedAt: mission.updatedAt,
            statistics: missionStats,
            churches: churchesWithStats,
            year
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la récupération des données de mission.' });
    }
});
// Get mission by ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const mission = await prisma.mission.findUnique({
            where: { id },
            include: { church: true },
        });
        if (!mission) {
            return res.status(404).json({ error: 'Mission non trouvée.' });
        }
        res.status(200).json(mission);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: error });
    }
});
// Update a mission
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { missionName, description, status, location, presidentName, } = req.body;
    console.log(req.body);
    try {
        const updatedMission = await prisma.mission.update({
            where: { id },
            data: {
                missionName,
                description,
                status,
                location,
                presidentName: presidentName ? presidentName.toLowerCase().trim().replace(/\s+/g, "") : undefined,
            },
        });
        res.status(200).json(updatedMission);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la mise à jour de la mission.' });
    }
});
// Delete a mission
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.mission.delete({ where: { id } });
        res.status(200).json({ message: 'Mission supprimée avec succès.' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la suppression.' });
    }
});
// Get all people from churches under a specific president's mission
router.get('/people/:presidentName', async (req, res) => {
    const { presidentName } = req.params;
    console.log("people president name : ", presidentName, presidentName.toLowerCase());
    const presidentNameLower = presidentName.toLowerCase();
    try {
        // Find the mission by president name
        const mission = await prisma.mission.findFirst({
            where: {
                presidentName: {
                    contains: presidentNameLower,
                    // mode: 'insensitive'
                }
            },
            include: {
                church: {
                    select: {
                        id: true
                    }
                }
            },
        });
        console.log("mission : ", mission);
        if (!mission) {
            console.log("aucune mission trouvé");
            return res.status(404).json({ error: 'Aucune mission trouvée pour ce président.' });
        }
        // Extract church IDs from the mission
        const churchIds = mission.church.map(church => church.id);
        // Get all users from these churches
        const users = await prisma.user.findMany({
            where: {
                churchId: {
                    in: churchIds
                }
            },
            select: {
                id: true,
                firstname: true,
                lastname: true,
                email: true,
                mobilePhone: true,
                homePhone: true,
                picture: true,
                churchRole: true,
                city: true,
                etatCivil: true,
                profession: true,
                membreActif: true,
                sex: true,
                addressLine: true,
                church: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });
        console.log("all users : ", users);
        res.status(200).json(users);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la récupération des personnes.' });
    }
});
// Get all groups from churches under a specific president's mission
router.get('/groups/:presidentName', async (req, res) => {
    const { presidentName } = req.params;
    console.log("presidentName : ", presidentName, presidentName.toLowerCase());
    const presidentNameLower = presidentName.toLowerCase();
    try {
        // Find the mission by president name
        const mission = await prisma.mission.findFirst({
            where: {
                presidentName: {
                    contains: presidentNameLower,
                    // mode: 'insensitive'
                }
            },
            include: {
                church: {
                    select: {
                        id: true
                    }
                }
            },
        });
        console.log("mission : ", mission);
        if (!mission) {
            console.log("aucune mission trouvé");
            return res.status(404).json({ error: 'Aucune mission trouvée pour ce président.' });
        }
        // Extract church IDs from the mission
        const churchIds = mission.church.map(church => church.id);
        // Get all groups from these churches
        const groups = await prisma.groupe.findMany({
            where: {
                churchId: {
                    in: churchIds
                }
            },
            include: {
                church: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                users: {
                    select: {
                        id: true,
                        firstname: true,
                        lastname: true,
                        picture: true
                    }
                }
            }
        });
        res.status(200).json(groups);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la récupération des groupes.' });
    }
});
// Get all pasteurs from churches under a specific president's mission
router.get('/pasteurs/:presidentName', async (req, res) => {
    const { presidentName } = req.params;
    try {
        // Find the mission by president name
        const mission = await prisma.mission.findFirst({
            where: {
                presidentName: {
                    contains: presidentName.toLowerCase().trim(),
                    // mode: 'insensitive'
                }
            },
            include: {
                church: {
                    select: {
                        id: true
                    }
                }
            },
        });
        if (!mission) {
            return res.status(404).json({ error: 'Aucune mission trouvée pour ce président.' });
        }
        // Extract church IDs from the mission
        const churchIds = mission.church.map(church => church.id);
        // Get all pasteurs from these churches
        const pasteurs = await prisma.pasteur.findMany({
            where: {
                churchId: {
                    in: churchIds
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
        res.status(200).json(pasteurs);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la récupération des pasteurs.' });
    }
});
exports.default = router;
