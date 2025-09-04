import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const templatesPath = path.join(__dirname, '../data/templates.json');

// GET /api/v1/templates?page=1&limit=20
router.get('/', (req, res) => {
  let templates: any[] = [];
  try {
    const raw = fs.readFileSync(templatesPath, 'utf-8');
    templates = JSON.parse(raw);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load templates.' });
  }

  // Pagination
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const start = (page - 1) * limit;
  const end = start + limit;
  const paged = templates.slice(start, end);

  res.json({
    page,
    limit,
    total: templates.length,
    templates: paged
  });
});

export default router;
