import type { ProjectContext } from '../../ai/types.js';

export class MasterDataManagementStrategyTemplate {
  private context: ProjectContext;

  constructor(context: ProjectContext) {
    this.context = context;
  }

  generateContent(): string {
    return `
# Master Data Management (MDM) Strategy for ${this.context.projectName}

## 1. Introduction

## 2. MDM Goals and Objectives

## 3. Scope

### 3.1. Master Data Domains

### 3.2. Systems in Scope

## 4. MDM Architecture

## 5. Governance and Stewardship

## 6. Data Quality for Master Data

## 7. Implementation Roadmap

## 8. Approval
`;
  }
}
