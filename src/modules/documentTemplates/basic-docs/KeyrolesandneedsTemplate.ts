import { ProjectContext } from '../../ai/types';

export class KeyrolesandneedsTemplate {
  buildPrompt(context: ProjectContext): string {
    return `You are an expert business analyst and requirements engineer. Generate a comprehensive analysis of key roles and their specific needs for the Requirements Gathering Agent project.

Include the following sections:
1. Executive Overview
2. Key Roles and Stakeholders (Business and Technical)
3. Role-Based Needs and Guidance
4. Unique Project Aspects
5. Practical Guidance & Onboarding
6. Role Mapping to System Permissions

For each role, include:
- Primary responsibilities
- Specific needs from the system
- Guidance on how to use the system effectively
- Permission levels required

Use clear tables and structured markdown format.

Project Context:
${JSON.stringify(context, null, 2)}`;
  }
}