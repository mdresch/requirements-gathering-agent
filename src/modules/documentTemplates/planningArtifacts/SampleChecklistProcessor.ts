import type { DocumentProcessor, DocumentOutput } from '../../documentGenerator/types';
import { SampleChecklistTemplate } from '../planningArtifacts/SampleChecklistTemplate';

export class SampleChecklistProcessor implements DocumentProcessor {
  async process(context: any): Promise<DocumentOutput> {
    const template = new SampleChecklistTemplate(context);
    const content = template.generateContent();
    return { title: 'SampleChecklist', content };
  }
}
