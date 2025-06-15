import type { ProjectContext } from '../../ai/types';
import type { DocumentProcessor, DocumentOutput } from '../../documentGenerator/types';
import { BABOKIntroductionTemplate } from '../BABOK/BABOKIntroductionTemplate';


/**
 * Processor for the BABOKIntroduction document.
 */
export class BABOKIntroductionProcessor implements DocumentProcessor {
  async process(context: ProjectContext): Promise<DocumentOutput> {
    const template = new BABOKIntroductionTemplate(context);
    const content = template.generateContent();
    return {
      title: 'BABOKIntroduction',
      content
    };
  }
}
