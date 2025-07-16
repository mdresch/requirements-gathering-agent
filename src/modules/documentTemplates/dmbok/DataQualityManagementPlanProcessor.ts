// DataQualityManagementPlanProcessor.ts
import { generateContent } from './DataQualityManagementPlanTemplate';
import type { ProjectContext } from '../../ai/types.js';
import type { DocumentProcessor } from '../../documentGenerator/types.js';

/**
 * Processor for Data Quality Management Plan document generation.
 */
export class DataQualityManagementPlanProcessor implements DocumentProcessor {
  async process(context: ProjectContext): Promise<string> {
    // You can add pre-processing or enrichment here if needed
    return generateContent(context);
  }
}
