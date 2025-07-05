// src/commands/analyze.ts
import { promises as fs } from 'fs';
import { join } from 'path';
import { 
  CONFIG_FILENAME, 
  PACKAGE_JSON_FILENAME, 
  TSCONFIG_JSON_FILENAME, 
  README_FILENAME, 
  PROCESSOR_CONFIG_FILENAME,
  ANALYZE_FILES 
} from '../constants.js';

export async function handleAnalyzeCommand(): Promise<void> {
  const cwd = process.cwd();
  console.log('🔍 Analyzing workspace...\n');
  const summary: string[] = [];

  // Check for key files
  const filesToCheck = ANALYZE_FILES;
  for (const file of filesToCheck) {
    try {
      const stat = await fs.stat(join(cwd, file));
      summary.push(`✅ ${file} found (${stat.isDirectory() ? 'directory' : 'file'})`);
    } catch {
      summary.push(`❌ ${file} missing`);
    }
  }

  // Output summary
  console.log(summary.join('\n'));
  console.log('\nAnalysis complete.');
}
