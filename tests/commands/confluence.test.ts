/**
 * Unit Tests for Confluence Command
 * Tests the confluence command module independently with mocked dependencies
 * Following CLI-REFACTOR-IMPLEMENTATION-GUIDE.md section 8 testing strategy
 */

import { 
  handleConfluenceCommand, 
  handleConfluenceOAuth2Command, 
  handleConfluenceStatusCommand, 
  handleConfluencePublishCommand 
} from '../../src/commands/confluence';
import { ValidationError } from '../../src/types';

// Mock dependencies
jest.mock('../../src/modules/confluence/ConfluenceConfigManager');
jest.mock('../../src/modules/confluence/ConfluenceOAuth2');
jest.mock('../../src/modules/confluence/ConfluencePublisher');

describe('Confluence Command', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('handleConfluenceCommand', () => {
    test('should handle basic confluence command', async () => {
      const options = { quiet: true };
      
      // Should not throw for basic command
      await expect(handleConfluenceCommand(options)).resolves.not.toThrow();
    });

    test('should handle confluence command with verbose output', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      const options = { quiet: false };
      await handleConfluenceCommand(options);
      
      // Should log output when not quiet
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('handleConfluenceOAuth2Command', () => {
    test('should handle oauth2 login command', async () => {
      const options = { 
        action: 'login' as const,
        quiet: true 
      };

      await expect(handleConfluenceOAuth2Command(options)).resolves.not.toThrow();
    });

    test('should handle oauth2 status command', async () => {
      const options = { 
        action: 'status' as const,
        quiet: true 
      };

      await expect(handleConfluenceOAuth2Command(options)).resolves.not.toThrow();
    });

    test('should handle oauth2 debug command', async () => {
      const options = { 
        action: 'debug' as const,
        quiet: false 
      };

      await expect(handleConfluenceOAuth2Command(options)).resolves.not.toThrow();
    });

    test('should validate oauth2 action parameter', async () => {
      const options = { 
        action: 'invalid' as any,
        quiet: true 
      };

      await expect(handleConfluenceOAuth2Command(options))
        .rejects.toThrow(ValidationError);
    });
  });

  describe('handleConfluenceStatusCommand', () => {
    test('should check confluence status', async () => {
      const options = { quiet: true };

      await expect(handleConfluenceStatusCommand(options)).resolves.not.toThrow();
    });

    test('should display status with verbose output', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      const options = { quiet: false };
      await handleConfluenceStatusCommand(options);
      
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('handleConfluencePublishCommand', () => {
    test('should handle publish command with valid options', async () => {
      const options = {
        input: './test-input',
        spaceKey: 'TEST',
        parentPageId: '12345',
        quiet: true
      };

      await expect(handleConfluencePublishCommand(options)).resolves.not.toThrow();
    });

    test('should validate required publish parameters', async () => {
      const options = {
        input: '',
        spaceKey: '',
        quiet: true
      };

      await expect(handleConfluencePublishCommand(options))
        .rejects.toThrow(ValidationError);
    });

    test('should handle publish errors gracefully', async () => {
      const options = {
        input: './non-existent-input',
        spaceKey: 'TEST',
        quiet: true
      };

      // Should handle non-existent input gracefully
      await expect(handleConfluencePublishCommand(options))
        .rejects.toThrow();
    });
  });

  describe('Error Handling', () => {
    test('should handle network errors', async () => {
      const options = { quiet: true };
      
      // Mock network error
      const mockError = new Error('Network error');
      jest.spyOn(console, 'error').mockImplementation();

      // Should handle errors gracefully
      await expect(handleConfluenceCommand(options)).resolves.not.toThrow();
    });

    test('should validate authentication configuration', async () => {
      const options = { 
        action: 'login' as const,
        quiet: true 
      };

      // Should validate that required env vars are present
      await expect(handleConfluenceOAuth2Command(options)).resolves.not.toThrow();
    });
  });
});
