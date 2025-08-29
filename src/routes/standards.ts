import express from 'express';
import fs from 'fs/promises';
import path from 'path';

const router = express.Router();
const dataFile = path.join(__dirname, '../data/standards.json');

// Helper to read/write JSON
async function readData() {
  const data = await fs.readFile(dataFile, 'utf-8');
  return JSON.parse(data);
}
async function writeData(data: any) {
  await fs.writeFile(dataFile, JSON.stringify(data, null, 2));
}

// GET all standards
router.get('/', async (req, res) => {
  const standards = await readData();
  res.json(standards);
});

// GET one standard
router.get('/:id', async (req, res) => {
  const standards = await readData();
  const standard = standards.find((s: any) => s.id === Number(req.params.id));
  if (!standard) return res.status(404).json({ error: 'Not found' });
  res.json(standard);
});

// POST create standard
router.post('/', async (req, res) => {
  const standards = await readData();
  const newStandard = { id: Date.now(), ...req.body };
  standards.push(newStandard);
  await writeData(standards);
  res.status(201).json(newStandard);
});

// PUT update standard
router.put('/:id', async (req, res) => {
  const standards = await readData();
  const idx = standards.findIndex((s: any) => s.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  standards[idx] = { ...standards[idx], ...req.body };
  await writeData(standards);
  res.json(standards[idx]);
});

// DELETE standard
router.delete('/:id', async (req, res) => {
  let standards = await readData();
  const idx = standards.findIndex((s: any) => s.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const deleted = standards[idx];
  standards = standards.filter((s: any) => s.id !== Number(req.params.id));
  await writeData(standards);
  res.json(deleted);
});

export default router;
