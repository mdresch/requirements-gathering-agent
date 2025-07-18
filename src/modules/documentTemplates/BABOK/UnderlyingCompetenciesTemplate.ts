import type { ProjectContext } from '../../ai/types';

/**
 * Underlying Competencies Template
 * Generates a standards-compliant BABOK Underlying Competencies document structure.
 */
export class UnderlyingCompetenciesTemplate {
  /**
   * Generate the markdown content for the Underlying Competencies document.
   * @param context ProjectContext for dynamic content injection
   */
  public generateContent(context: ProjectContext): string {
    return `# Underlying Competencies (BABOK v3)

## Purpose
Describes the underlying competencies required for effective business analysis, including analytical thinking, communication, interaction skills, and business knowledge.

## 1. Analytical Thinking & Problem Solving
- Creative thinking
- Decision making
- Learning
- Problem solving
- Systems thinking

## 2. Behavioral Characteristics
- Ethics
- Personal accountability
- Trustworthiness
- Organization and time management
- Adaptability

## 3. Business Knowledge
- Industry knowledge
- Organization knowledge
- Solution knowledge
- Methodology knowledge

## 4. Communication Skills
- Oral communication
- Teaching
- Written communication
- Listening

## 5. Interaction Skills
- Facilitation
- Leadership and influencing
- Teamwork
- Negotiation and conflict resolution

## 6. Tools & Technology
- Office productivity tools
- Modeling tools
- Communication and collaboration platforms

---
*This document provides a structured overview of the competencies that support effective business analysis as defined by BABOK v3.*
`;
  }
}
