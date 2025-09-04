import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const dataFile = path.join(__dirname, '../data/reviewers.json');

async function readData() {
  const data = await fs.readFile(dataFile, 'utf-8');
  return JSON.parse(data);
}
async function writeData(data: any) {
  await fs.writeFile(dataFile, JSON.stringify(data, null, 2));
}

router.get('/', async (req, res) => {
  const reviewers = await readData();
  res.json(reviewers);
});

router.get('/:id', async (req, res) => {
  const reviewers = await readData();
  const reviewer = reviewers.find((r: any) => r.id === Number(req.params.id));
  if (!reviewer) return res.status(404).json({ error: 'Not found' });
  res.json(reviewer);
});

router.post('/', async (req, res) => {
  const reviewers = await readData();
  const newReviewer = { id: Date.now(), ...req.body };
  reviewers.push(newReviewer);
  await writeData(reviewers);
  res.status(201).json(newReviewer);
});

router.put('/:id', async (req, res) => {
  const reviewers = await readData();
  const idx = reviewers.findIndex((r: any) => r.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  reviewers[idx] = { ...reviewers[idx], ...req.body };
  await writeData(reviewers);
  res.json(reviewers[idx]);
});

router.delete('/:id', async (req, res) => {
  let reviewers = await readData();
  const idx = reviewers.findIndex((r: any) => r.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const deleted = reviewers[idx];
  reviewers = reviewers.filter((r: any) => r.id !== Number(req.params.id));
  await writeData(reviewers);
  res.json(deleted);
});

export default router;
