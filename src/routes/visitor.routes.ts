import { Router, type NextFunction, type Request, type Response } from 'express';
import jwt from 'jsonwebtoken';
import { Prisma } from '../generated/prisma';
import { prisma } from '../utils/client';
import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';
import { AlignmentType, Document, Packer, Paragraph, Table, TableCell, TableRow, TextRun, WidthType } from 'docx';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fkhdlhfjdl389484934893lhfjd938439843949hjfdh384934343434344894jkjkfdjfjd378434jkfdf';
const VISITOR_STATUSES = ['Nouveau', 'À contacter', 'Contacté', 'Revenu'] as const;

declare global {
  namespace Express {
    interface Request {
      visitorAdmin?: { id: string; churchId: string };
    }
  }
}

const requireChurchAdmin = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Authentification requise' });

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { id: string };
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, role: true, churchId: true, membreActif: true },
    });

    if (!user?.membreActif) return res.status(403).json({ message: 'Compte indisponible' });
    if (user.role !== 'Admin') {
      return res.status(403).json({ message: 'Cette fonctionnalité est réservée aux administrateurs' });
    }
    if (!user.churchId) {
      return res.status(403).json({ message: 'Votre compte doit être associé à une église' });
    }

    req.visitorAdmin = { id: user.id, churchId: user.churchId };
    next();
  } catch {
    return res.status(401).json({ message: 'Session invalide ou expirée' });
  }
};

const cleanOptionalString = (value: unknown, maxLength = 191) => {
  if (typeof value !== 'string') return null;
  const cleaned = value.trim().slice(0, maxLength);
  return cleaned || null;
};

const cleanRequiredString = (value: unknown, maxLength = 191) =>
  typeof value === 'string' ? value.trim().slice(0, maxLength) : '';

const cleanDate = (value: unknown) => {
  const date = cleanOptionalString(value, 10);
  return date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : null;
};

const cleanStatus = (value: unknown) => {
  const status = cleanRequiredString(value);
  return VISITOR_STATUSES.includes(status as typeof VISITOR_STATUSES[number]) ? status : 'Nouveau';
};

const createVisitorCode = async () => {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const code = `VIS-${Math.floor(100000 + Math.random() * 900000)}`;
    const existing = await prisma.visitor.findUnique({ where: { code }, select: { id: true } });
    if (!existing) return code;
  }
  return `VIS-${Date.now().toString().slice(-10)}`;
};

router.use(requireChurchAdmin);

router.get('/stats', async (req, res) => {
  try {
    const churchId = req.visitorAdmin!.churchId;
    const monthStart = new Date().toISOString().slice(0, 7) + '-01';
    const [total, newThisMonth, followUp, affiliated] = await Promise.all([
      prisma.visitor.count({ where: { churchId } }),
      prisma.visitor.count({ where: { churchId, visitDate: { gte: monthStart } } }),
      prisma.visitor.count({ where: { churchId, status: { in: ['Nouveau', 'À contacter'] } } }),
      prisma.visitor.count({ where: { churchId, isAffiliated: true } }),
    ]);
    res.json({ total, newThisMonth, followUp, affiliated });
  } catch (error) {
    console.error('Visitor stats error:', error);
    res.status(500).json({ message: 'Impossible de charger les statistiques des visiteurs' });
  }
});

router.get('/reports/export', async (req, res) => {
  try {
    const churchId = req.visitorAdmin!.churchId;
    const format = cleanRequiredString(req.query.format, 10).toLowerCase();
    const dateFrom = cleanDate(req.query.dateFrom);
    const dateTo = cleanDate(req.query.dateTo);
    const gender = cleanOptionalString(req.query.gender);

    if (!['pdf', 'xlsx', 'docx'].includes(format)) {
      return res.status(400).json({ message: 'Format de rapport invalide' });
    }
    if (dateFrom && dateTo && dateFrom > dateTo) {
      return res.status(400).json({ message: 'La date de début doit précéder la date de fin' });
    }

    const where: Prisma.VisitorWhereInput = {
      churchId,
      ...(gender && gender !== 'Tous' ? { gender } : {}),
      ...((dateFrom || dateTo) ? {
        visitDate: {
          ...(dateFrom ? { gte: dateFrom } : {}),
          ...(dateTo ? { lte: dateTo } : {}),
        },
      } : {}),
    };

    const [church, visitors] = await Promise.all([
      prisma.church.findUnique({ where: { id: churchId }, select: { name: true } }),
      prisma.visitor.findMany({
        where,
        orderBy: [{ visitDate: 'desc' }, { lastname: 'asc' }],
        select: {
          code: true,
          firstname: true,
          lastname: true,
          gender: true,
          mobilePhone: true,
          email: true,
          visitDate: true,
          status: true,
          isAffiliated: true,
        },
      }),
    ]);

    const churchName = church?.name || 'Église';
    const generatedAt = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeStyle: 'short' }).format(new Date());
    const dateLabel = dateFrom || dateTo
      ? `${dateFrom || 'Début'} au ${dateTo || 'Aujourd’hui'}`
      : 'Toutes les dates';
    const filenameBase = `rapport-visiteurs-${new Date().toISOString().slice(0, 10)}`;
    const reportSubtitle = `Période : ${dateLabel}  |  Genre : ${gender || 'Tous'}  |  Total : ${visitors.length}`;

    if (format === 'xlsx') {
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'Ecclesys';
      workbook.created = new Date();
      const sheet = workbook.addWorksheet('Visiteurs', { views: [{ state: 'frozen', ySplit: 5 }] });
      sheet.mergeCells('A1:I1');
      sheet.getCell('A1').value = `Rapport des visiteurs — ${churchName}`;
      sheet.getCell('A1').font = { size: 18, bold: true, color: { argb: 'FF0F766E' } };
      sheet.mergeCells('A2:I2');
      sheet.getCell('A2').value = reportSubtitle;
      sheet.getCell('A2').font = { size: 11, color: { argb: 'FF475569' } };
      sheet.mergeCells('A3:I3');
      sheet.getCell('A3').value = `Généré le ${generatedAt}`;
      sheet.getCell('A3').font = { size: 10, italic: true, color: { argb: 'FF64748B' } };
      sheet.addRow([]);
      sheet.addRow(['Code', 'Nom', 'Prénom', 'Genre', 'Téléphone', 'Email', 'Date de visite', 'Statut', 'Affilié(e)']);
      const header = sheet.getRow(5);
      header.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      header.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F766E' } };
      header.alignment = { vertical: 'middle' };
      header.height = 24;
      visitors.forEach((visitor) => sheet.addRow([
        visitor.code, visitor.firstname, visitor.lastname, visitor.gender || '', visitor.mobilePhone || '',
        visitor.email || '', visitor.visitDate, visitor.status, visitor.isAffiliated ? 'Oui' : 'Non',
      ]));
      sheet.columns = [
        { width: 16 }, { width: 20 }, { width: 20 }, { width: 13 }, { width: 18 },
        { width: 30 }, { width: 17 }, { width: 22 }, { width: 13 },
      ];
      sheet.eachRow((row, rowNumber) => {
        if (rowNumber > 5 && rowNumber % 2 === 0) row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0FDFA' } };
        row.alignment = { vertical: 'middle' };
      });
      const buffer = await workbook.xlsx.writeBuffer();
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filenameBase}.xlsx"`);
      return res.send(Buffer.from(buffer));
    }

    if (format === 'docx') {
      const tableRows = [
        new TableRow({
          tableHeader: true,
          children: ['Code', 'Nom complet', 'Genre', 'Téléphone', 'Date', 'Statut', 'Affilié(e)'].map((text) =>
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text, bold: true, color: 'FFFFFF' })] })], shading: { fill: '0F766E' } }),
          ),
        }),
        ...visitors.map((visitor) => new TableRow({ children: [
          visitor.code,
          `${visitor.firstname} ${visitor.lastname}`,
          visitor.gender || '',
          visitor.mobilePhone || '',
          visitor.visitDate,
          visitor.status,
          visitor.isAffiliated ? 'Oui' : 'Non',
        ].map((text) => new TableCell({ children: [new Paragraph(String(text))] })) })),
      ];
      const document = new Document({ sections: [{ children: [
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `Rapport des visiteurs — ${churchName}`, bold: true, size: 34, color: '0F766E' })], spacing: { after: 180 } }),
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: reportSubtitle, size: 20, color: '475569' })], spacing: { after: 100 } }),
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `Généré le ${generatedAt}`, italics: true, size: 18, color: '64748B' })], spacing: { after: 300 } }),
        new Table({ rows: tableRows, width: { size: 100, type: WidthType.PERCENTAGE } }),
      ] }] });
      const buffer = await Packer.toBuffer(document);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', `attachment; filename="${filenameBase}.docx"`);
      return res.send(buffer);
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filenameBase}.pdf"`);
    const document = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 36, bufferPages: true });
    document.pipe(res);
    const drawHeader = () => {
      document.font('Helvetica-Bold').fontSize(17).fillColor('#0f766e').text(`Rapport des visiteurs — ${churchName}`);
      document.moveDown(0.35).font('Helvetica').fontSize(9).fillColor('#475569').text(reportSubtitle);
      document.moveDown(0.2).fontSize(8).fillColor('#64748b').text(`Généré le ${generatedAt}`);
      document.moveDown(0.8);
      const y = document.y;
      document.rect(36, y, 770, 22).fill('#0f766e');
      document.fillColor('#ffffff').font('Helvetica-Bold').fontSize(8);
      ['Code', 'Nom complet', 'Genre', 'Téléphone', 'Date', 'Statut', 'Affilié(e)'].forEach((text, index) => {
        const positions = [42, 125, 295, 360, 470, 550, 720];
        document.text(text, positions[index], y + 7, { width: index === 1 ? 160 : 95, ellipsis: true });
      });
      document.y = y + 28;
    };
    drawHeader();
    visitors.forEach((visitor, index) => {
      if (document.y > 535) { document.addPage(); drawHeader(); }
      const y = document.y;
      if (index % 2 === 0) document.rect(36, y - 3, 770, 19).fill('#f0fdfa');
      document.fillColor('#1e293b').font('Helvetica').fontSize(8);
      const values = [visitor.code, `${visitor.firstname} ${visitor.lastname}`, visitor.gender || '', visitor.mobilePhone || '', visitor.visitDate, visitor.status, visitor.isAffiliated ? 'Oui' : 'Non'];
      const positions = [42, 125, 295, 360, 470, 550, 720];
      values.forEach((text, column) => document.text(String(text), positions[column], y, { width: column === 1 ? 160 : 95, ellipsis: true, lineBreak: false }));
      document.y = y + 19;
    });
    if (!visitors.length) document.fillColor('#64748b').fontSize(11).text('Aucun visiteur ne correspond aux critères sélectionnés.', { align: 'center' });
    document.end();
  } catch (error) {
    console.error('Visitor report error:', error);
    if (!res.headersSent) res.status(500).json({ message: 'Impossible de générer le rapport des visiteurs' });
  }
});

router.get('/', async (req, res) => {
  try {
    const churchId = req.visitorAdmin!.churchId;
    const page = Math.max(1, Number.parseInt(String(req.query.page || '1'), 10) || 1);
    const limit = Math.min(100, Math.max(1, Number.parseInt(String(req.query.limit || '20'), 10) || 20));
    const search = cleanOptionalString(req.query.search, 100);
    const status = cleanOptionalString(req.query.status);
    const gender = cleanOptionalString(req.query.gender);
    const dateFrom = cleanDate(req.query.dateFrom);
    const dateTo = cleanDate(req.query.dateTo);
    const affiliation = req.query.affiliation;

    const where: Prisma.VisitorWhereInput = {
      churchId,
      ...(search ? {
        OR: [
          { code: { contains: search } },
          { firstname: { contains: search } },
          { lastname: { contains: search } },
          { mobilePhone: { contains: search } },
          { email: { contains: search } },
        ],
      } : {}),
      ...(status && status !== 'Tous' ? { status } : {}),
      ...(gender && gender !== 'Tous' ? { gender } : {}),
      ...(affiliation === 'true' || affiliation === 'false' ? { isAffiliated: affiliation === 'true' } : {}),
      ...((dateFrom || dateTo) ? {
        visitDate: {
          ...(dateFrom ? { gte: dateFrom } : {}),
          ...(dateTo ? { lte: dateTo } : {}),
        },
      } : {}),
    };

    const [items, total] = await prisma.$transaction([
      prisma.visitor.findMany({
        where,
        orderBy: [{ visitDate: 'desc' }, { createdAt: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.visitor.count({ where }),
    ]);

    res.json({
      items,
      pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
    });
  } catch (error) {
    console.error('Visitor list error:', error);
    res.status(500).json({ message: 'Impossible de charger les visiteurs' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const visitor = await prisma.visitor.findFirst({
      where: { id: req.params.id, churchId: req.visitorAdmin!.churchId },
    });
    if (!visitor) return res.status(404).json({ message: 'Visiteur introuvable' });
    res.json(visitor);
  } catch (error) {
    console.error('Visitor details error:', error);
    res.status(500).json({ message: 'Impossible de charger ce visiteur' });
  }
});

router.post('/', async (req, res) => {
  try {
    const firstname = cleanRequiredString(req.body.firstname);
    const lastname = cleanRequiredString(req.body.lastname);
    const visitDate = cleanDate(req.body.visitDate);
    if (!firstname || !lastname || !visitDate) {
      return res.status(400).json({ message: 'Le nom, le prénom et la date de visite sont obligatoires' });
    }

    const visitor = await prisma.visitor.create({
      data: {
        code: await createVisitorCode(),
        firstname,
        lastname,
        gender: cleanOptionalString(req.body.gender),
        mobilePhone: cleanOptionalString(req.body.mobilePhone),
        email: cleanOptionalString(req.body.email),
        addressLine: cleanOptionalString(req.body.addressLine),
        city: cleanOptionalString(req.body.city),
        country: cleanOptionalString(req.body.country),
        visitDate,
        discoverySource: cleanOptionalString(req.body.discoverySource),
        invitedBy: cleanOptionalString(req.body.invitedBy),
        visitReason: cleanOptionalString(req.body.visitReason),
        status: cleanStatus(req.body.status),
        isAffiliated: req.body.isAffiliated === true || req.body.isAffiliated === 'true',
        church: { connect: { id: req.visitorAdmin!.churchId } },
      },
    });
    res.status(201).json(visitor);
  } catch (error) {
    console.error('Visitor creation error:', error);
    res.status(500).json({ message: 'Impossible de créer le visiteur' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const existing = await prisma.visitor.findFirst({
      where: { id: req.params.id, churchId: req.visitorAdmin!.churchId },
      select: { id: true, visitDate: true },
    });
    if (!existing) return res.status(404).json({ message: 'Visiteur introuvable' });

    const firstname = cleanRequiredString(req.body.firstname);
    const lastname = cleanRequiredString(req.body.lastname);
    const visitDate = cleanDate(req.body.visitDate) || existing.visitDate;
    if (!firstname || !lastname) {
      return res.status(400).json({ message: 'Le nom et le prénom sont obligatoires' });
    }

    const visitor = await prisma.visitor.update({
      where: { id: existing.id },
      data: {
        firstname,
        lastname,
        gender: cleanOptionalString(req.body.gender),
        mobilePhone: cleanOptionalString(req.body.mobilePhone),
        email: cleanOptionalString(req.body.email),
        addressLine: cleanOptionalString(req.body.addressLine),
        city: cleanOptionalString(req.body.city),
        country: cleanOptionalString(req.body.country),
        visitDate,
        discoverySource: cleanOptionalString(req.body.discoverySource),
        invitedBy: cleanOptionalString(req.body.invitedBy),
        visitReason: cleanOptionalString(req.body.visitReason),
        status: cleanStatus(req.body.status),
        isAffiliated: req.body.isAffiliated === true || req.body.isAffiliated === 'true',
      },
    });
    res.json(visitor);
  } catch (error) {
    console.error('Visitor update error:', error);
    res.status(500).json({ message: 'Impossible de modifier le visiteur' });
  }
});

router.patch('/:id/status', async (req, res) => {
  try {
    const status = cleanStatus(req.body.status);
    const existing = await prisma.visitor.findFirst({
      where: { id: req.params.id, churchId: req.visitorAdmin!.churchId },
      select: { id: true },
    });
    if (!existing) return res.status(404).json({ message: 'Visiteur introuvable' });

    const visitor = await prisma.visitor.update({ where: { id: existing.id }, data: { status } });
    res.json(visitor);
  } catch (error) {
    console.error('Visitor status error:', error);
    res.status(500).json({ message: 'Impossible de modifier le statut' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await prisma.visitor.deleteMany({
      where: { id: req.params.id, churchId: req.visitorAdmin!.churchId },
    });
    if (!result.count) return res.status(404).json({ message: 'Visiteur introuvable' });
    res.status(204).send();
  } catch (error) {
    console.error('Visitor deletion error:', error);
    res.status(500).json({ message: 'Impossible de supprimer le visiteur' });
  }
});

export default router;
