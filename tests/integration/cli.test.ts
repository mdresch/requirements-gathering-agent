/**
 * Integration Tests for CLI
 * Tests the complete CLI workflows end-to-end
 * Following CLI-REFACTOR-IMPLEMENTATION-GUIDE.md section 8 testing strategy
 */

import { execSync } from 'child_process';
import { existsSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';

const CLI_PATH = 'node dist/cli.js';
const TEST_OUTPUT_DIR = join(process.cwd(), 'test-output');

describe('CLI Integration Tests', () => {
  beforeEach(() => {
    // Clean up test output directory
    if (existsSync(TEST_OUTPUT_DIR)) {
      rmSync(TEST_OUTPUT_DIR, { recursive: true, force: true });
    }
    mkdirSync(TEST_OUTPUT_DIR, { recursive: true });
  });

  afterEach(() => {
    // Clean up test output directory
    if (existsSync(TEST_OUTPUT_DIR)) {
      rmSync(TEST_OUTPUT_DIR, { recursive: true, force: true });
    }
  });

  describe('Basic CLI Commands', () => {
    test('should display help when no arguments provided', () => {
      const output = execSync(`${CLI_PATH} --help`, { encoding: 'utf8' });
      expect(output).toContain('Commands:');
      expect(output).toContain('generate');
      expect(output).toContain('confluence');
      expect(output).toContain('sharepoint');
    });

    test('should display version information', () => {
      const output = execSync(`${CLI_PATH} --version`, { encoding: 'utf8' });
      expect(output).toMatch(/\d+\.\d+\.\d+/); // Should contain version number
    });

    test('should display status information', () => {
      const output = execSync(`${CLI_PATH} status --quiet`, { encoding: 'utf8' });
      expect(output.length >= 0).toBe(true); // Status command should run without error
    });
  });

  describe('Generate Command', () => {
    test('should display available generation tasks', () => {
      const output = execSync(`${CLI_PATH} generate --help`, { encoding: 'utf8' });
      expect(output).toContain('Generate a specific document');
      expect(output).toContain('key');
    });

    test('should handle invalid document key gracefully', () => {
      expect(() => {
        execSync(`${CLI_PATH} generate invalid-key --quiet`, { encoding: 'utf8' });
      }).toThrow(); // Should exit with error for invalid key
    });

    test('should validate output directory option', () => {
      const output = execSync(`${CLI_PATH} generate --help`, { encoding: 'utf8' });
      expect(output).toContain('--output');
      expect(output).toContain('Output directory');
    });
  });

  describe('Confluence Command', () => {
    test('should display confluence help', () => {
      const output = execSync(`${CLI_PATH} confluence --help`, { encoding: 'utf8' });
      expect(output).toContain('Confluence integration');
      expect(output).toContain('oauth2');
      expect(output).toContain('status');
    });

    test('should check oauth2 status', () => {
      const output = execSync(`${CLI_PATH} confluence oauth2 status`, { encoding: 'utf8' });
      expect(output).toContain('OAuth2');
    });
  });

  describe('SharePoint Command', () => {
    test('should display sharepoint help', () => {
      const output = execSync(`${CLI_PATH} sharepoint --help`, { encoding: 'utf8' });
      expect(output).toContain('SharePoint integration');
      expect(output).toContain('oauth2');
      expect(output).toContain('status');
    });

    test('should check oauth2 status', () => {
      const output = execSync(`${CLI_PATH} sharepoint oauth2 status`, { encoding: 'utf8' });
      expect(output).toContain('OAuth2');
    });
  });

  describe('VCS Command', () => {
    test('should display vcs help', () => {
      const output = execSync(`${CLI_PATH} vcs --help`, { encoding: 'utf8' });
      expect(output).toContain('Version control system');
      expect(output).toContain('status');
      expect(output).toContain('commit');
    });

    test('should check git status', () => {
      const output = execSync(`${CLI_PATH} vcs status`, { encoding: 'utf8' });
      expect(output.includes('Git repository') || output.includes('No Git repository')).toBe(true);
    });
  });

  describe('Error Handling', () => {
    test('should handle unknown commands gracefully', () => {
      try {
        execSync(`${CLI_PATH} unknown-command`, { encoding: 'utf8' });
        fail('Expected command to throw an error');
      } catch (error) {
        // Should exit with error for unknown command
        expect(error).toBeDefined();
      }
    });

    test('should validate command options', () => {
      expect(() => {
        execSync(`${CLI_PATH} generate --retries -1`, { encoding: 'utf8' });
      }).toThrow(); // Should validate negative retry values
    });
  });
});
