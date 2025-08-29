import express from 'express';
import fs from 'fs/promises';
import path from 'path';

const router = express.Router();
const dataFile = path.join(__dirname, '../data/reviews.json');

async function readData() {
  const data = await fs.readFile(dataFile, 'utf-8');
  return JSON.parse(data);
}
async function writeData(data: any) {
  await fs.writeFile(dataFile, JSON.stringify(data, null, 2));
}

router.get('/', async (req, res) => {
  const reviews = await readData();
  res.json(reviews);
});

router.get('/:id', async (req, res) => {
  const reviews = await readData();
  const review = reviews.find((r: any) => r.id === Number(req.params.id));
  if (!review) return res.status(404).json({ error: 'Not found' });
  res.json(review);
});

router.post('/', async (req, res) => {
  const reviews = await readData();
  const newReview = { id: Date.now(), ...req.body };
  reviews.push(newReview);
  await writeData(reviews);
  res.status(201).json(newReview);
});

router.put('/:id', async (req, res) => {
  const reviews = await readData();
  const idx = reviews.findIndex((r: any) => r.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  reviews[idx] = { ...reviews[idx], ...req.body };
  await writeData(reviews);
  res.json(reviews[idx]);
});

router.delete('/:id', async (req, res) => {
  let reviews = await readData();
  const idx = reviews.findIndex((r: any) => r.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const deleted = reviews[idx];
  reviews = reviews.filter((r: any) => r.id !== Number(req.params.id));
  await writeData(reviews);
  res.json(deleted);
});

export default router;
