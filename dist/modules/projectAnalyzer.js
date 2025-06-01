import * as fs from 'fs/promises';
import * as path from 'path';
/**
 * Reads the README.md file from the given project path.
 * @param projectPath - The root directory of the project.
 * @returns The content of README.md if found, otherwise null.
 */
export async function getReadmeContent(projectPath) {
    const readmePath = path.join(projectPath, 'README.md');
    try {
        const content = await fs.readFile(readmePath, 'utf-8');
        return content;
    }
    catch (err) {
        if (err.code === 'ENOENT') {
            return null;
        }
        throw err;
    }
}
/**
 * Reads and parses the package.json file from the given project path.
 * @param projectPath - The root directory of the project.
 * @returns The parsed package.json object if found and valid, otherwise null.
 */
export async function getProjectPackageJson(projectPath) {
    const pkgPath = path.join(projectPath, 'package.json');
    try {
        const content = await fs.readFile(pkgPath, 'utf-8');
        return JSON.parse(content);
    }
    catch (err) {
        if (err.code === 'ENOENT') {
            return null;
        }
        // Optionally log error or rethrow
        return null;
    }
}
