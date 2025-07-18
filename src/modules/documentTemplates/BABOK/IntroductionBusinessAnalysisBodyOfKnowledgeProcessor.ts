import type { ProjectContext } from '../../ai/types';
import type { DocumentProcessor, DocumentOutput } from '../../documentGenerator/types';
import { IntroductionBusinessAnalysisBodyOfKnowledgeTemplate } from './IntroductionBusinessAnalysisBodyOfKnowledgeTemplate.js';

/**
 * Processor for the Introduction Business Analysis Body of Knowledge document.
 */
export class IntroductionBusinessAnalysisBodyOfKnowledgeProcessor implements DocumentProcessor {
  async process(context: ProjectContext): Promise<DocumentOutput> {
    const template = new IntroductionBusinessAnalysisBodyOfKnowledgeTemplate(context);
    const content = template.generateContent();
    return {
      title: 'Introduction Business Analysis Body of Knowledge',
      content
    };
  }
}
