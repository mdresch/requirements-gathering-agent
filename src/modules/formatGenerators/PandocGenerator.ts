import { writeFile } from 'fs/promises';
import { exec } from 'child_process';

// Minimal PandocGenerator stub for build compatibility
export class PandocGenerator {
  constructor(options: any) {}

  async generatePowerPointDocument(content: string, outputPath: string): Promise<void> {
    // Stub: Implement actual Pandoc integration here
    return;
  }

  async generateWordDocument(content: string, outputPath: string): Promise<void> {
    // Write the markdown content to a temp file
    const tmp = await import('os');
    const tmpDir = tmp.tmpdir();
    const tmpFile = `${tmpDir}/pandoc-tmp-${Date.now()}.md`;
    await writeFile(tmpFile, content, 'utf-8');
    // Build the pandoc command
    const cmd = `pandoc "${tmpFile}" -o "${outputPath}" --standalone`;
    await new Promise<void>((resolve, reject) => {
      exec(cmd, (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`Pandoc failed: ${stderr || error.message}`));
        } else {
          resolve();
        }
      });
    });
    // Optionally, remove the temp file (not strictly necessary)
    try { await import('fs').then(fs => fs.unlinkSync(tmpFile)); } catch {}
  }
}