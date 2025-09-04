// Simple Express.js backend for /api/v1/projects
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { Project, Template, DocumentGeneration, Document, Reviewer, Review, ScopeControl, Standard } from './types';

const app = express();
const PORT = 3002;

app.use(cors());

app.get('/api/v1/projects', (req, res) => {
  const filePath = path.join(__dirname, '../../src/data/projects.json');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Could not read projects.json' });
    }
    try {
      const projects: Project[] = JSON.parse(data);
      res.json(projects);
    } catch (parseErr) {
      res.status(500).json({ error: 'Invalid JSON format in projects.json' });
    }
  });
});

app.get('/api/v1/templates', (req, res) => {
  const filePath = path.join(__dirname, '../../src/data/templates.json');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Could not read templates.json' });
    }
    try {
      const templates: Template[] = JSON.parse(data);
      res.json(templates);
    } catch (parseErr) {
      res.status(500).json({ error: 'Invalid JSON format in templates.json' });
    }
  });
});

app.get('/api/v1/document-generation', (req, res) => {
  const filePath = path.join(__dirname, '../../src/data/documentGeneration.json');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Could not read documentGeneration.json' });
    }
    try {
      const documents: DocumentGeneration[] = JSON.parse(data);
      res.json(documents);
    } catch (parseErr) {
      res.status(500).json({ error: 'Invalid JSON format in documentGeneration.json' });
    }
  });
});

app.get('/api/v1/documents', (req, res) => {
  const filePath = path.join(__dirname, '../../src/data/documents.json');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Could not read documents.json' });
    }
    try {
      const documents: Document[] = JSON.parse(data);
      res.json(documents);
    } catch (parseErr) {
      res.status(500).json({ error: 'Invalid JSON format in documents.json' });
    }
  });
});

app.get('/api/v1/reviewers', (req, res) => {
  const filePath = path.join(__dirname, '../../src/data/reviewers.json');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Could not read reviewers.json' });
    }
    try {
      const reviewers: Reviewer[] = JSON.parse(data);
      res.json(reviewers);
    } catch (parseErr) {
      res.status(500).json({ error: 'Invalid JSON format in reviewers.json' });
    }
  });
});

app.get('/api/v1/reviews', (req, res) => {
  const filePath = path.join(__dirname, '../../src/data/reviews.json');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Could not read reviews.json' });
    }
    try {
      const reviews: Review[] = JSON.parse(data);
      res.json(reviews);
    } catch (parseErr) {
      res.status(500).json({ error: 'Invalid JSON format in reviews.json' });
    }
  });
});

app.get('/api/v1/scopecontrol', (req, res) => {
  const filePath = path.join(__dirname, '../../src/data/scopeControl.json');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Could not read scopeControl.json' });
    }
    try {
      const scopeControls: ScopeControl[] = JSON.parse(data);
      res.json(scopeControls);
    } catch (parseErr) {
      res.status(500).json({ error: 'Invalid JSON format in scopeControl.json' });
    }
  });
});

app.get('/api/v1/standards', (req, res) => {
  const filePath = path.join(__dirname, '../../src/data/standards.json');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Could not read standards.json' });
    }
    try {
      const standards: Standard[] = JSON.parse(data);
      res.json(standards);
    } catch (parseErr) {
      res.status(500).json({ error: 'Invalid JSON format in standards.json' });
    }
  });
});

app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
