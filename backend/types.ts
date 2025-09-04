// Types for Express.js backend data
export interface Project {
  id: number;
  name: string;
  description: string;
  status: string;
  framework: string;
  complianceScore: number;
  createdAt: string;
  updatedAt: string;
  documents: number;
  stakeholders: number;
}

export interface Template {
  id: number;
  name: string;
  description: string;
  fields: string[];
}

export interface DocumentGeneration {
  id: number;
  template: string;
  status: string;
}

export interface Document {
  id: number;
  title: string;
  content: string;
}

export interface Reviewer {
  id: number;
  name: string;
  role: string;
}

export interface Review {
  id: number;
  documentId: number;
  reviewer: string;
  status: string;
}

export interface ScopeControl {
  id: number;
  scope: string;
  description: string;
}

export interface Standard {
  id: number;
  name: string;
  description: string;
}
