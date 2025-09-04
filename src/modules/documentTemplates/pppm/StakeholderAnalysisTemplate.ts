import type { ProjectContext } from '../../ai/types';

/**
 * Template for Stakeholder Analysis & Communication Plan Document
 * Designed for PPPM (Project, Program, Portfolio Management) context
 */
export class StakeholderAnalysisTemplate {
  static title = 'Stakeholder Analysis & Communication Plan';
  
  /**
   * Build the prompt for AI-powered content generation
   * @param context Project context containing relevant information
   * @returns Structured prompt for stakeholder analysis document
   */
  buildPrompt(context: ProjectContext): string {
    const projectName = context.projectName || 'Project';
    const projectDescription = context.description || 'No description provided';
    
    return `# Stakeholder Analysis & Communication Plan for ${projectName}

**Project Overview:** ${projectDescription}

## Document Purpose
Create a comprehensive Stakeholder Analysis and Communication Plan that identifies all stakeholders, analyzes their influence and interest levels, and defines engagement and communication strategies to ensure project success.

## Required Document Structure

### 1. Stakeholder Analysis Matrix
Create a detailed matrix including:
- **Stakeholder Identification**: List all internal and external stakeholders
- **Role/Title**: Position and organization
- **Interest Level**: High/Medium/Low interest in project outcomes
- **Influence Level**: High/Medium/Low ability to impact project
- **Impact Assessment**: How the project affects each stakeholder
- **Support Level**: Supportive/Neutral/Resistant to project

### 2. Communication Plan
Develop a comprehensive communication strategy:
- **Communication Objectives**: Clear goals for stakeholder communication
- **Communication Matrix**: Stakeholder-specific communication details including:
  - Primary communication methods (meetings, reports, emails)
  - Frequency of communication (daily, weekly, monthly)
  - Type of information to be shared
  - Responsible party for communication
  - Preferred communication channels
- **Escalation Procedures**: Process for addressing stakeholder concerns
- **Feedback Mechanisms**: How stakeholder input will be collected and used

### 3. Stakeholder Engagement Activities
Define specific engagement strategies:
- **High Power/High Interest Stakeholders**: Manage closely with regular engagement
- **High Power/Low Interest Stakeholders**: Keep satisfied with periodic updates
- **Low Power/High Interest Stakeholders**: Keep informed through regular communication
- **Low Power/Low Interest Stakeholders**: Monitor with minimal communication
- **Engagement Timeline**: Key engagement activities mapped to project phases
- **Success Metrics**: How to measure effective stakeholder engagement
- **Risk Mitigation**: Strategies for managing stakeholder-related risks

## Context Integration Requirements
- Analyze project scope and complexity to determine stakeholder universe
- Consider organizational structure and reporting relationships
- Account for external regulatory or compliance stakeholders if applicable
- Integrate with project timeline and major milestones
- Align with project budget constraints for communication activities

## Deliverable Format
Provide a professional, actionable document that can be used by project managers and teams to effectively manage stakeholder relationships throughout the project lifecycle.

Please generate comprehensive, detailed content for each section based on the project context provided.`;
  }
  
  /**
   * Get the sections structure for the document
   * @param context Project context
   * @returns Array of document sections
   */
  static getSections(context?: ProjectContext) {
    const safeContext: Partial<ProjectContext> = context || {};
    const projectName = safeContext.projectName || 'Project';
    
    return [
      {
        title: 'Executive Summary',
        content: `[AI_SYNTHESIS: Create an executive summary that outlines the key stakeholders, their influence levels, and the overall communication strategy for ${projectName}]`
      },
      {
        title: 'Stakeholder Analysis Matrix',
        content: `[AI_SYNTHESIS: Create a comprehensive stakeholder analysis matrix with columns for Stakeholder Name, Role/Title, Organization, Interest Level, Influence Level, Impact Assessment, and Support Level. Include both internal and external stakeholders relevant to ${projectName}]`
      },
      {
        title: 'Power/Interest Grid Analysis',
        content: `[AI_SYNTHESIS: Develop a power/interest grid analysis that categorizes stakeholders into four quadrants (Manage Closely, Keep Satisfied, Keep Informed, Monitor) with specific engagement strategies for each category]`
      },
      {
        title: 'Communication Plan',
        content: `[AI_SYNTHESIS: Create a detailed communication plan including communication objectives, a communication matrix specifying methods/frequency/content for each stakeholder group, escalation procedures, and feedback mechanisms]`
      },
      {
        title: 'Stakeholder Engagement Activities',
        content: `[AI_SYNTHESIS: Define specific engagement activities for each stakeholder category, including engagement timeline, success metrics, and risk mitigation strategies for stakeholder management]`
      },
      {
        title: 'Communication Tools and Channels',
        content: `[AI_SYNTHESIS: Specify the communication tools, platforms, and channels that will be used for different types of stakeholder communication, including decision-making processes and information sharing protocols]`
      },
      {
        title: 'Monitoring and Review Process',
        content: `[AI_SYNTHESIS: Establish processes for monitoring stakeholder satisfaction, reviewing engagement effectiveness, and updating the stakeholder analysis and communication plan as the project evolves]`
      }
    ];
  }
}