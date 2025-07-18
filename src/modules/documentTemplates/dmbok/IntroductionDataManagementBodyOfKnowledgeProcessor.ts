import type { ProjectContext } from '../../ai/types';
import type { DocumentProcessor, DocumentOutput } from '../../documentGenerator/types';
import { IntroductionDataManagementBodyOfKnowledgeTemplate } from './IntroductionDataManagementBodyOfKnowledgeTemplate.js';

/**
 * Processor for the Introduction Data Management Body of Knowledge document.
 */
export class IntroductionDataManagementBodyOfKnowledgeProcessor implements DocumentProcessor {
  async process(context: ProjectContext): Promise<DocumentOutput> {
    const template = new IntroductionDataManagementBodyOfKnowledgeTemplate(context);
    const content = template.generateContent();
    return {
      title: 'Introduction Data Management Body of Knowledge',
      content
    };
  }
}
