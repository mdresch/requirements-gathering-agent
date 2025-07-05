/**
 * Validate Command Handler
 * Validates generated documents against PMBOK standards
 */

import { join } from 'path';
import { writeFile } from 'fs/promises';
import { PMBOKValidator } from '../modules/pmbokValidation/PMBOKValidator.js';
import { 
  DEFAULT_OUTPUT_DIR,
  COMPLIANCE_REPORT_FILENAME,
  PROMPT_ADJUSTMENT_REPORT_FILENAME 
} from '../constants.js';

/**
 * Handler for the 'validate' command - validates documents against PMBOK
 */
export async function handleValidateCommand(options: ValidateOptions = {}): Promise<void> {
  const { outputDir = DEFAULT_OUTPUT_DIR, quiet = false } = options;
  
  if (!quiet) {
    console.log('🔍 Validating documents against PMBOK standards...');
  }

  const validator = new PMBOKValidator();
  const result = await validator.validatePMBOKCompliance();

  if (!quiet) {
    console.log('PMBOK Compliance:', result.compliance);
    console.log('Critical Findings:', result.findings.critical);
    console.log('Warnings:', result.findings.warnings);
    console.log('Recommendations:', result.findings.recommendations);
    console.log('Document Quality:', result.documentQuality);
  }

  // Generate and save Markdown compliance report
  const mdReport = formatMarkdownReport(result);
  const mdReportPath = join(outputDir, COMPLIANCE_REPORT_FILENAME);
  await writeFile(mdReportPath, mdReport);
  
  if (!quiet) {
    console.log('Markdown compliance report written to:', mdReportPath);
  }

  // Generate and save prompt adjustment report
  const promptReport = generatePromptAdjustmentReport(result);
  const promptReportPath = join(outputDir, PROMPT_ADJUSTMENT_REPORT_FILENAME);
  await writeFile(promptReportPath, promptReport);
  
  if (!quiet) {
    console.log('Prompt adjustment report written to:', promptReportPath);
  }
}

/**
 * Format validation results as Markdown
 */
function formatMarkdownReport(result: any): string {
  return `\n# PMBOK Compliance Report\n\n` +
    `**Overall Compliance:** ${result.compliance ? '✅ Compliant' : '❌ Non-compliant'}\n\n` +
    `## Critical Findings\n${result.findings.critical.length ? result.findings.critical.map((f: any) => `- ${f}`).join('\n') : 'None'}\n\n` +
    `## Warnings\n${result.findings.warnings.length ? result.findings.warnings.map((f: any) => `- ${f}`).join('\n') : 'None'}\n\n` +
    `## Recommendations\n${result.findings.recommendations.length ? result.findings.recommendations.map((f: any) => `- ${f}`).join('\n') : 'None'}\n\n` +
    `## Document Quality\n${Object.entries(result.documentQuality).map(([doc, quality]) => {
      const q = quality as { score: number; issues: string[]; strengths: string[] };
      return `### ${doc}\n- Score: ${q.score}\n- Issues: ${q.issues.join('; ') || 'None'}\n- Strengths: ${q.strengths.join('; ') || 'None'}`;
    }).join('\n\n')}`;
}

/**
 * Generate prompt adjustment report based on validation results
 */
function generatePromptAdjustmentReport(result: any): string {
  const missingElementsByDoc: Record<string, string[]> = {};
  
  for (const finding of result.findings.critical) {
    const match = finding.match(/^(.+): Missing required PMBOK element '(.+)'/);
    if (match) {
      const [ , doc, element ] = match;
      if (!missingElementsByDoc[doc]) missingElementsByDoc[doc] = [];
      missingElementsByDoc[doc].push(element);
    }
  }
  
  let promptReport = '\n=== PROMPT ADJUSTMENT REPORT ===\n';
  
  for (const [doc, elements] of Object.entries(missingElementsByDoc)) {
    const els = elements as string[];
    promptReport += `\nDocument: ${doc}\n`;
    els.forEach(el => promptReport += `  - Missing required element: ${el}\n`);
  }
  
  if (Object.keys(missingElementsByDoc).length === 0) {
    promptReport += 'All required PMBOK elements are present in your documents!\n';
  }
  
  return promptReport;
}

// Types
export interface ValidateOptions {
  outputDir?: string;
  quiet?: boolean;
}
