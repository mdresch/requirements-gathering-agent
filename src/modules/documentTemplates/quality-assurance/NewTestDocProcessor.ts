import type { ProjectContext } from '../../ai/types';
import type { DocumentProcessor, DocumentOutput } from '../../documentGenerator/types';
import { NewTestDocTemplate } from './NewTestDocTemplate';


/**
 * Processor for the NewTestDoc document.
 */
export class NewTestDocProcessor implements DocumentProcessor {
  async process(context: ProjectContext): Promise<DocumentOutput> {
    const template = new NewTestDocTemplate(context);
    const content = template.generateContent();
    return {
      title: 'NewTestDoc',
      content
    };
  }
}
