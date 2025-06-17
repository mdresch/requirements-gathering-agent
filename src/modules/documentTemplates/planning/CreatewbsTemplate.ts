import type { ProjectContext } from '../../ai/types.js';

/**
 * Template for Create WBS Process document
 * Work Breakdown Structure creation process following PMBOK guidelines
 */
export class CreatewbsTemplate {
  private context: ProjectContext;

  constructor(context?: ProjectContext) {
    this.context = context || {} as ProjectContext;
  }

  getSections(): string[] {
    return [
      'Introduction',
      'Purpose and Scope',
      'WBS Creation Process',
      'Decomposition Techniques',
      'Work Package Definition',
      'WBS Dictionary',
      'Validation and Review',
      'Maintenance and Updates'
    ];
  }

  getMetadata() {
    return {
      title: 'Create WBS Process',
      description: 'Comprehensive Work Breakdown Structure creation process document',
      version: '1.0.0',
      category: 'management-plans'
    };
  }

  generatePrompt(context: ProjectContext): string {
    return `Generate a comprehensive Create WBS (Work Breakdown Structure) Process document for the following project:

**Project Context:**
- Name: ${context.projectName || 'Project Name'}
- Type: ${context.projectType || 'Software Development'}
- Description: ${context.description || 'Project description'}

**Document Requirements:**
Create a detailed document that includes:

# Create WBS Process

## 1. Introduction
- Purpose of the WBS creation process
- Alignment with project objectives
- Integration with project management plan

## 2. Process Overview
- Step-by-step WBS creation methodology
- Key inputs and tools required
- Expected outputs and deliverables

## 3. Decomposition Approach
- Hierarchical decomposition strategy
- Level of detail guidelines
- Decomposition criteria and rules

## 4. Work Package Definition
- Work package characteristics
- Size and duration guidelines
- Accountability and responsibility assignment

## 5. WBS Dictionary Integration
- Dictionary creation process
- Required information for each element
- Documentation standards

## 6. Validation and Quality Control
- Review and approval process
- Quality checkpoints
- Stakeholder validation

## 7. Maintenance Procedures
- Change control process
- Update triggers and procedures
- Version control

**Instructions:**
- Use professional project management language
- Include practical examples where appropriate
- Follow PMBOK 7th Edition guidelines
- Ensure content is specific to the project context
- Use proper markdown formatting
- Make recommendations actionable`;
  }

  generateContent(): string {
    return `# Create WBS Process

## 1. Introduction

The Work Breakdown Structure (WBS) creation process defines the systematic approach for decomposing project deliverables and work into smaller, more manageable components.

## 2. Process Overview

### Key Steps:
1. Define project scope baseline
2. Identify major deliverables
3. Decompose deliverables hierarchically
4. Create work packages
5. Validate with stakeholders

## 3. Decomposition Approach

### Hierarchical Structure:
- Level 1: Project
- Level 2: Major deliverables
- Level 3: Sub-deliverables
- Level 4: Work packages

## 4. Work Package Guidelines

### Characteristics:
- Clearly defined scope
- Measurable outcomes
- Assignable to single responsibility
- Appropriate duration (typically 8-80 hours)

## 5. Quality Control

### Validation Criteria:
- 100% rule compliance
- Mutually exclusive elements
- Appropriate level of detail
- Stakeholder approval`;
  }
}
