import { ProjectContext } from '../../ai/types';
import { DocumentOutput } from '../../documentGenerator/types';
import { DataManagementStrategyTemplate } from './dataManagementStrategyTemplate';

export class DataManagementStrategyProcessor {
  process(context: ProjectContext): DocumentOutput {
    const template = new DataManagementStrategyTemplate();
    const content = template.generateContent(context);
    return {
      title: 'Data Management Strategy',
      content
    };
  }
}
