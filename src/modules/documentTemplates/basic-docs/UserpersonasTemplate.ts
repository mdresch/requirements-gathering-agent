import { ProjectContext } from '../../ai/types';

export class UserpersonasTemplate {
  buildPrompt(context: ProjectContext): string {
    return `You are an expert business analyst. Generate a set of user personas for the following project context. Each persona should include: name, role, goals, pain points, technology comfort, and a short bio. Use Markdown format with clear sections for each persona.\n\nProject Context:\n${JSON.stringify(context, null, 2)}`;
  }
}
