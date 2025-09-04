import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const dataFile = path.join(__dirname, '../data/scopeControl.json');

async function readData() {
  const data = await fs.readFile(dataFile, 'utf-8');
  return JSON.parse(data);
}
async function writeData(data: any) {
  await fs.writeFile(dataFile, JSON.stringify(data, null, 2));
}

router.get('/', async (req, res) => {
  const scopes = await readData();
  res.json(scopes);
});

router.get('/:id', async (req, res) => {
  const scopes = await readData();
  const scope = scopes.find((s: any) => s.id === Number(req.params.id));
  if (!scope) return res.status(404).json({ error: 'Not found' });
  res.json(scope);
});

router.post('/', async (req, res) => {
  const scopes = await readData();
  const newScope = { id: Date.now(), ...req.body };
  scopes.push(newScope);
  await writeData(scopes);
  res.status(201).json(newScope);
});

router.put('/:id', async (req, res) => {
  const scopes = await readData();
  const idx = scopes.findIndex((s: any) => s.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  scopes[idx] = { ...scopes[idx], ...req.body };
  await writeData(scopes);
  res.json(scopes[idx]);
});

router.delete('/:id', async (req, res) => {
  let scopes = await readData();
  const idx = scopes.findIndex((s: any) => s.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const deleted = scopes[idx];
  scopes = scopes.filter((s: any) => s.id !== Number(req.params.id));
  await writeData(scopes);
  res.json(deleted);
});

export default router;
