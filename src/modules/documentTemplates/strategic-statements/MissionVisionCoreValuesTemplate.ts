import type { ProjectContext } from '../../ai/types';

/**
 * MissionVisionCoreValues Template generates the content for the MissionVisionCoreValues document.
 */
export class MissionVisionCoreValuesTemplate {
  constructor(private context: ProjectContext) {}

  /**
   * Build the markdown content for MissionVisionCoreValues
   */
  generateContent(): string {
    return `# Mission, Vision, and Core Values

**Project:** ${this.context.projectName || 'Untitled Project'}

${this.context.description ? `**Description:** ${this.context.description}\n\n` : ''}

## Mission Statement

*[Define the fundamental purpose and reason for existence of this project/organization]*

**Our Mission:** To deliver innovative solutions that drive meaningful impact and create lasting value for our stakeholders.

## Vision Statement

*[Describe the desired future state and long-term aspirations]*

**Our Vision:** To be recognized as a leader in technology innovation, setting new standards for excellence and transforming how organizations operate.

## Core Values

*[List the fundamental beliefs and principles that guide decision-making and behavior]*

### 1. **Innovation**
- Embrace creativity and continuous improvement
- Challenge conventional thinking
- Foster a culture of experimentation

### 2. **Integrity**
- Act with honesty and transparency
- Build trust through consistent actions
- Take responsibility for our commitments

### 3. **Excellence**
- Strive for the highest quality in everything we do
- Continuously learn and grow
- Exceed expectations consistently

### 4. **Collaboration**
- Work together to achieve common goals
- Value diverse perspectives and ideas
- Build strong partnerships

### 5. **Customer Focus**
- Put customer needs at the center of our decisions
- Deliver exceptional value and service
- Build lasting relationships

## Implementation Guidelines

### Living Our Values
- Regular team discussions about value alignment
- Integration into performance reviews and hiring processes
- Recognition programs that celebrate value-driven behaviors

### Communication Strategy
- Regular reinforcement through internal communications
- Visual displays and reminders in work environments
- Integration into onboarding and training programs

### Measurement and Accountability
- Regular surveys to assess value alignment
- Specific metrics tied to each core value
- Action plans for areas needing improvement

---

*This document should be reviewed annually and updated as the organization evolves.*`;
  }
}
