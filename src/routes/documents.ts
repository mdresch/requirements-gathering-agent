import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

const router = Router();
const dbPath = path.join(__dirname, '../data/documents.json');

function readDB() {
  return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
}
function writeDB(data: any) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

// GET / - List all documents
router.get('/', (req: Request, res: Response) => {
  const docs = readDB();
  res.json(docs);
});

// GET /:id - Get document by ID
router.get('/:id', (req: Request, res: Response) => {
  const docs = readDB();
  const doc = docs.find((d: any) => d.id === Number(req.params.id));
  if (!doc) return res.status(404).json({ error: 'Document not found' });
  res.json(doc);
});

// POST / - Create a new document
router.post('/', (req: Request, res: Response) => {
  const docs = readDB();
  const newDoc = {
    id: docs.length ? docs[docs.length - 1].id + 1 : 1,
    title: req.body.title,
    content: req.body.content
  };
  docs.push(newDoc);
  writeDB(docs);
  res.status(201).json(newDoc);
});

// PUT /:id - Update a document
router.put('/:id', (req: Request, res: Response) => {
  const docs = readDB();
  const idx = docs.findIndex((d: any) => d.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Document not found' });
  docs[idx] = { ...docs[idx], ...req.body };
  writeDB(docs);
  res.json(docs[idx]);
});

// DELETE /:id - Delete a document
router.delete('/:id', (req: Request, res: Response) => {
  let docs = readDB();
  const idx = docs.findIndex((d: any) => d.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Document not found' });
  const deleted = docs[idx];
  docs = docs.filter((d: any) => d.id !== Number(req.params.id));
  writeDB(docs);
  res.json(deleted);
});

export default router;
