import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const dataFile = path.join(__dirname, '../data/documentGeneration.json');

async function readData() {
  const data = await fs.readFile(dataFile, 'utf-8');
  return JSON.parse(data);
}
async function writeData(data: any) {
  await fs.writeFile(dataFile, JSON.stringify(data, null, 2));
}

router.get('/', async (req, res) => {
  const docs = await readData();
  res.json(docs);
});

router.get('/:id', async (req, res) => {
  const docs = await readData();
  const doc = docs.find((d: any) => d.id === Number(req.params.id));
  if (!doc) return res.status(404).json({ error: 'Not found' });
  res.json(doc);
});

router.post('/', async (req, res) => {
  const docs = await readData();
  const newDoc = { id: Date.now(), ...req.body };
  docs.push(newDoc);
  await writeData(docs);
  res.status(201).json(newDoc);
});

router.put('/:id', async (req, res) => {
  const docs = await readData();
  const idx = docs.findIndex((d: any) => d.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  docs[idx] = { ...docs[idx], ...req.body };
  await writeData(docs);
  res.json(docs[idx]);
});

router.delete('/:id', async (req, res) => {
  let docs = await readData();
  const idx = docs.findIndex((d: any) => d.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const deleted = docs[idx];
  docs = docs.filter((d: any) => d.id !== Number(req.params.id));
  await writeData(docs);
  res.json(deleted);
});

export default router;
