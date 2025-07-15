import { ProjectContext } from '../../ai/types';

export class DataManagementStrategyTemplate {
  buildPrompt(context: ProjectContext): string {
    return `You are a world-class data management consultant. Analyze the following project context and synthesize a comprehensive, actionable Data Management Strategy in Markdown format. Do NOT simply restate the context. Instead, generate original, tailored content that demonstrates deep understanding and best practices.\n\n**Instructions:**\n- Write in a professional, advisory tone.\n- Include the following sections: Introduction, Data Management Objectives, Alignment with Business Goals, Data Governance Principles, Roles and Responsibilities, Data Management Processes, Compliance and Standards, Monitoring and Continuous Improvement.\n- For each section, provide specific recommendations, examples, and justifications based on the project context.\n- Use bullet points, tables, and subheadings where appropriate.\n- The output should be ready for client delivery.\n\n**Project Context:**\n${JSON.stringify(context, null, 2)}`;
  }
}
