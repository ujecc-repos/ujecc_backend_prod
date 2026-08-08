import express from 'express';
import jwt from 'jsonwebtoken';
import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';
import { AlignmentType, Document, Packer, Paragraph, Table, TableCell, TableRow, TextRun, WidthType } from 'docx';
import { prisma } from '../utils/client';

const router = express.Router()
const JWT_SECRET = process.env.JWT_SECRET || 'fkhdlhfjdl389484934893lhfjd938439843949hjfdh384934343434344894jkjkfdjfjd378434jkfdf';

const getReportRequester = async (req: express.Request, res: express.Response) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    res.status(401).json({ message: 'Authentification requise' });
    return null;
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { id: string };
    const user = await prisma.user.findUnique({ where: { id: payload.id }, select: { id: true, churchId: true, membreActif: true } });
    if (!user?.membreActif || !user.churchId) {
      res.status(403).json({ message: 'Compte ou église indisponible' });
      return null;
    }
    return user;
  } catch {
    res.status(401).json({ message: 'Session invalide ou expirée' });
    return null;
  }
};

const reportDateRange = (dateFrom: unknown, dateTo: unknown, timezoneOffset: unknown) => {
  if (typeof dateFrom !== 'string' || typeof dateTo !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dateFrom) || !/^\d{4}-\d{2}-\d{2}$/.test(dateTo) || dateFrom > dateTo) return null;
  const parsedOffset = Number.parseInt(String(timezoneOffset ?? '0'), 10);
  const offset = Number.isFinite(parsedOffset) && parsedOffset >= -840 && parsedOffset <= 840 ? parsedOffset : 0;
  const start = new Date(new Date(`${dateFrom}T00:00:00.000Z`).getTime() + offset * 60_000);
  const endStart = new Date(new Date(`${dateTo}T00:00:00.000Z`).getTime() + offset * 60_000);
  return { start, end: new Date(endStart.getTime() + 86_400_000 - 1), offset };
};

const presenceStatusLabel = (status: string) => ({ PRESENT: 'Présent', ABSENT: 'Absent', MOTIVE: 'Excusé', EN_RETARD: 'En retard' }[status] || status);

const formatReportDateTime = (value: Date, offset: number) => new Intl.DateTimeFormat('fr-FR', {
  dateStyle: 'short', timeStyle: 'short', timeZone: 'UTC',
}).format(new Date(value.getTime() - offset * 60_000));

/**
 * Créer une présence pour un utilisateur et un événement
 */
router.post("/", async (req, res) => {
  const { utilisateurId, serviceId, statut, attendanceDate, markedAt } = req.body;
  const offlineOperationId = typeof req.body.offlineOperationId === 'string'
    ? req.body.offlineOperationId.trim().slice(0, 191)
    : undefined;
  try {
    if (offlineOperationId) {
      const previousAttempt = await prisma.presence.findUnique({
        where: { offlineOperationId },
        include: { user: true, service: true },
      });
      if (previousAttempt) {
        return res.json({ ...previousAttempt, deduplicated: true });
      }
    }

    // Preserve both the calendar day and the exact time at which attendance
    // was marked. Offline clients send their original timestamp during sync.
    const validAttendanceDate = typeof attendanceDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(attendanceDate)
      ? attendanceDate
      : new Date().toISOString().slice(0, 10);
    const requestedMarkedDate = typeof markedAt === 'string' ? new Date(markedAt) : null;
    const markedDate = requestedMarkedDate && !Number.isNaN(requestedMarkedDate.getTime())
      ? requestedMarkedDate
      : new Date();
    const startOfDay = new Date(`${validAttendanceDate}T00:00:00.000Z`);
    const endOfDay = new Date(`${validAttendanceDate}T23:59:59.999Z`);

    const existingPresence = await prisma.presence.findFirst({
      where: {
        utilisateurId,
        serviceId,
        createdAt: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    });

    if (existingPresence) {
      return res.status(409).json({
        error: "Vous avez déjà marqué votre présence pour ce service aujourd'hui",
        code: 'PRESENCE_ALREADY_EXISTS'
      });
    }

    // Create the presence if no duplicate found
    const presence = await prisma.presence.create({
      data: {
        utilisateurId,
        serviceId,
        statut,
        createdAt: markedDate,
        offlineOperationId: offlineOperationId || null,
      },
      include: { user: true, service: true },
    });
    res.json(presence);
  } catch (err) {
    if (offlineOperationId) {
      const previousAttempt = await prisma.presence.findUnique({
        where: { offlineOperationId },
        include: { user: true, service: true },
      });
      if (previousAttempt) {
        return res.json({ ...previousAttempt, deduplicated: true });
      }
    }
    console.log("error is : ", err)
    res.status(500).json({ error: "Impossible de créer la présence" });
  }
});

router.get("/utilisateurs/:id/presences", async (req, res) => {
  const { id } = req.params;
  try {
    const presences = await prisma.presence.findMany({
      where: { utilisateurId: id },
      include: { service: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(presences);
  } catch (err) {
    res.status(500).json({ error: "Impossible de récupérer les présences" });
  }
});

router.get('/services/:id/report-members', async (req, res) => {
  try {
    const requester = await getReportRequester(req, res);
    if (!requester) return;
    const search = typeof req.query.search === 'string' ? req.query.search.trim().slice(0, 100) : '';
    if (search.length < 2) return res.json([]);

    const service = await prisma.service.findFirst({ where: { id: req.params.id, churchId: requester.churchId }, select: { id: true } });
    if (!service) return res.status(404).json({ message: 'Service introuvable' });

    const members = await prisma.user.findMany({
      where: {
        churchId: requester.churchId,
        presences: { some: { serviceId: service.id, statut: 'PRESENT' } },
        OR: [
          { firstname: { contains: search } },
          { lastname: { contains: search } },
          { code: { contains: search } },
          { email: { contains: search } },
        ],
      },
      select: { id: true, code: true, firstname: true, lastname: true, email: true },
      orderBy: [{ firstname: 'asc' }, { lastname: 'asc' }],
      take: 12,
    });
    res.json(members);
  } catch (error) {
    console.error('Presence report member search error:', error);
    res.status(500).json({ message: 'Impossible de rechercher les membres' });
  }
});

router.get('/services/:id/reports/export', async (req, res) => {
  try {
    const requester = await getReportRequester(req, res);
    if (!requester) return;
    const format = typeof req.query.format === 'string' ? req.query.format.toLowerCase() : '';
    const memberId = typeof req.query.memberId === 'string' ? req.query.memberId : '';
    const range = reportDateRange(req.query.dateFrom, req.query.dateTo, req.query.timezoneOffset);
    if (!['pdf', 'xlsx', 'docx'].includes(format)) return res.status(400).json({ message: 'Format de rapport invalide' });
    if (!memberId) return res.status(400).json({ message: 'Veuillez sélectionner un membre' });
    if (!range) return res.status(400).json({ message: 'Intervalle de dates invalide' });

    const [service, member, church] = await Promise.all([
      prisma.service.findFirst({ where: { id: req.params.id, churchId: requester.churchId }, select: { id: true, nom: true } }),
      prisma.user.findFirst({ where: { id: memberId, churchId: requester.churchId }, select: { id: true, code: true, firstname: true, lastname: true, email: true, mobilePhone: true } }),
      prisma.church.findUnique({ where: { id: requester.churchId! }, select: { name: true } }),
    ]);
    if (!service) return res.status(404).json({ message: 'Service introuvable' });
    if (!member) return res.status(404).json({ message: 'Membre introuvable' });

    const presences = await prisma.presence.findMany({
      where: { serviceId: service.id, utilisateurId: member.id, statut: 'PRESENT', createdAt: { gte: range.start, lte: range.end } },
      select: { id: true, statut: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    });
    const memberName = `${member.firstname} ${member.lastname}`;
    const summary = `Période : ${req.query.dateFrom} au ${req.query.dateTo}  |  Total des présences : ${presences.length}`;
    const generatedAt = formatReportDateTime(new Date(), range.offset);
    const filename = `rapport-presence-${member.code || member.id.slice(0, 8)}-${req.query.dateFrom}-${req.query.dateTo}`.replace(/[^a-zA-Z0-9_-]/g, '-');
    const title = `Rapport de présence — ${service.nom}`;
    const organization = church?.name || 'Église';

    if (format === 'xlsx') {
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'Ecclesys';
      const sheet = workbook.addWorksheet('Présences', { views: [{ state: 'frozen', ySplit: 7 }] });
      sheet.mergeCells('A1:D1'); sheet.getCell('A1').value = title; sheet.getCell('A1').font = { size: 18, bold: true, color: { argb: 'FF0F766E' } };
      sheet.mergeCells('A2:D2'); sheet.getCell('A2').value = organization; sheet.getCell('A2').font = { size: 11, color: { argb: 'FF475569' } };
      sheet.mergeCells('A3:D3'); sheet.getCell('A3').value = `Membre : ${memberName}${member.code ? ` (${member.code})` : ''}`; sheet.getCell('A3').font = { bold: true, size: 12 };
      sheet.mergeCells('A4:D4'); sheet.getCell('A4').value = summary; sheet.getCell('A4').font = { size: 10, color: { argb: 'FF475569' } };
      sheet.mergeCells('A5:D5'); sheet.getCell('A5').value = `Généré le ${generatedAt}`; sheet.getCell('A5').font = { italic: true, size: 9, color: { argb: 'FF64748B' } };
      sheet.addRow([]); sheet.addRow(['N°', 'Date', 'Heure', 'Statut']);
      const header = sheet.getRow(7); header.font = { bold: true, color: { argb: 'FFFFFFFF' } }; header.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F766E' } }; header.height = 24;
      presences.forEach((presence, index) => {
        const local = formatReportDateTime(presence.createdAt, range.offset).split(' ');
        sheet.addRow([index + 1, local[0], local.slice(1).join(' '), presenceStatusLabel(presence.statut)]);
      });
      sheet.columns = [{ width: 8 }, { width: 18 }, { width: 15 }, { width: 20 }];
      const buffer = await workbook.xlsx.writeBuffer();
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.xlsx"`);
      return res.send(Buffer.from(buffer));
    }

    if (format === 'docx') {
      const rows = [
        new TableRow({ tableHeader: true, children: ['N°', 'Date et heure', 'Statut'].map((text) => new TableCell({ shading: { fill: '0F766E' }, children: [new Paragraph({ children: [new TextRun({ text, bold: true, color: 'FFFFFF' })] })] })) }),
        ...presences.map((presence, index) => new TableRow({ children: [String(index + 1), formatReportDateTime(presence.createdAt, range.offset), presenceStatusLabel(presence.statut)].map((text) => new TableCell({ children: [new Paragraph(text)] })) })),
      ];
      const document = new Document({ sections: [{ children: [
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: title, bold: true, size: 34, color: '0F766E' })], spacing: { after: 100 } }),
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: organization, size: 20, color: '475569' })], spacing: { after: 180 } }),
        new Paragraph({ children: [new TextRun({ text: `Membre : ${memberName}${member.code ? ` (${member.code})` : ''}`, bold: true, size: 23 })], spacing: { after: 100 } }),
        new Paragraph({ children: [new TextRun({ text: summary, size: 19, color: '475569' })], spacing: { after: 80 } }),
        new Paragraph({ children: [new TextRun({ text: `Généré le ${generatedAt}`, italics: true, size: 17, color: '64748B' })], spacing: { after: 250 } }),
        new Table({ rows, width: { size: 100, type: WidthType.PERCENTAGE } }),
      ] }] });
      const buffer = await Packer.toBuffer(document);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.docx"`);
      return res.send(buffer);
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.pdf"`);
    const document = new PDFDocument({ size: 'A4', margin: 45, bufferPages: true });
    document.pipe(res);
    document.font('Helvetica-Bold').fontSize(18).fillColor('#0f766e').text(title, { align: 'center' });
    document.moveDown(0.2).font('Helvetica').fontSize(10).fillColor('#475569').text(organization, { align: 'center' });
    document.moveDown(1).font('Helvetica-Bold').fontSize(11).fillColor('#1e293b').text(`Membre : ${memberName}${member.code ? ` (${member.code})` : ''}`);
    document.moveDown(0.4).font('Helvetica').fontSize(9).fillColor('#475569').text(summary);
    document.moveDown(0.2).fontSize(8).fillColor('#64748b').text(`Généré le ${generatedAt}`);
    document.moveDown(1);
    let y = document.y;
    const drawHeader = () => { y = document.y; document.rect(45, y, 505, 22).fill('#0f766e'); document.fillColor('#fff').font('Helvetica-Bold').fontSize(9).text('N°', 52, y + 7).text('Date et heure', 100, y + 7).text('Statut', 390, y + 7); document.y = y + 29; };
    drawHeader();
    presences.forEach((presence, index) => {
      if (document.y > 750) { document.addPage(); drawHeader(); }
      y = document.y; if (index % 2 === 0) document.rect(45, y - 3, 505, 20).fill('#f0fdfa');
      document.fillColor('#1e293b').font('Helvetica').fontSize(9).text(String(index + 1), 52, y).text(formatReportDateTime(presence.createdAt, range.offset), 100, y).text(presenceStatusLabel(presence.statut), 390, y); document.y = y + 20;
    });
    if (!presences.length) document.fillColor('#64748b').fontSize(10).text('Aucune présence pour cet intervalle.', { align: 'center' });
    document.end();
  } catch (error) {
    console.error('Presence report error:', error);
    if (!res.headersSent) res.status(500).json({ message: 'Impossible de générer le rapport de présence' });
  }
});

router.get("/services/:id/presences", async (req, res) => {
  const { id } = req.params;
  const {
    page = '1',
    limit = '10',
    search = '',
    status = '',
    date = '',
    timezoneOffset = '0',
    userId = ''
  } = req.query;

  try {
    // Parse pagination parameters
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;


    // Build where clause with filters
    const whereClause: any = { serviceId: id };

    // Check if user has ministry restrictions
    if (userId && userId !== '') {
      const currentUser = await prisma.user.findUnique({
        where: { id: userId as string },
        select: { role: true, ministryId: true }
      });

      // console.log("current user : ", currentUser, currentUser?.ministryId, currentUser?.role)
      // If user is "Leader" or has a ministry assigned, filter by ministry
      if (currentUser && (currentUser.role === 'Leader' || currentUser.ministryId)) {
        whereClause.user = {
          ...whereClause.user,
          ministryId: currentUser.ministryId
        };
      }
    }

    // Add search filter for user firstname, lastname, or email
    if (search && search !== '') {
      whereClause.user = {
        ...whereClause.user,
        OR: [
          { firstname: { contains: search as string } },
          { lastname: { contains: search as string } },
          { email: { contains: search as string } }
        ]
      };
    }

    // Add status filter
    if (status && status !== '' && status !== 'all') {
      whereClause.statut = status as string;
    }

    // Add date filter for exact date match
    if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
      const parsedOffset = Number.parseInt(String(timezoneOffset), 10);
      const safeOffset = Number.isFinite(parsedOffset) && parsedOffset >= -840 && parsedOffset <= 840
        ? parsedOffset
        : 0;
      const localMidnightAsUtc = new Date(`${date}T00:00:00.000Z`).getTime();
      const startOfDay = new Date(localMidnightAsUtc + safeOffset * 60_000);
      const endOfDay = new Date(startOfDay.getTime() + 86_400_000 - 1);

      whereClause.createdAt = {
        gte: startOfDay,
        lte: endOfDay
      };
    }

    // Get total count for pagination
    const total = await prisma.presence.count({ where: whereClause });

    // Get paginated presences
    const presences = await prisma.presence.findMany({
      where: whereClause,
      include: { user: true, service: true },
      orderBy: { createdAt: "desc" },
      skip,
      take: limitNum,
    });

    // Calculate total pages
    const totalPages = Math.ceil(total / limitNum);

    // Return paginated response with metadata
    res.json({
      data: presences,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages
      }
    });
  } catch (err) {
    console.log("error is: ", err);
    res.status(500).json({ error: "Impossible de récupérer les présences" });
  }
});

export default router
