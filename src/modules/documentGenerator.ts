import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Generates a markdown file with a title and content in the specified output directory.
 * @param outputDir - The directory to write the file to.
 * @param fileName - The name of the markdown file.
 * @param title - The title to prepend to the content.
 * @param content - The main content to write.
 */
export async function generateMarkdownFile(
  outputDir: string,
  fileName: string,
  title: string,
  content: string
): Promise<void> {
  // Ensure the output directory exists
  await fs.mkdir(outputDir, { recursive: true });
  
  const filePath = path.join(outputDir, fileName);
  const fileContent = `# ${title}\n\n${content}`;
  await fs.writeFile(filePath, fileContent, 'utf-8');
}
