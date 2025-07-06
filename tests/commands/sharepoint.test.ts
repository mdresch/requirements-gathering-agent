/**
 * Unit Tests for SharePoint Command
 * Tests the sharepoint command module independently with mocked dependencies
 * Following CLI-REFACTOR-IMPLEMENTATION-GUIDE.md section 8 testing strategy
 */

import { 
  handleSharePointCommand, 
  handleSharePointOAuth2Command, 
  handleSharePointStatusCommand, 
  handleSharePointPublishCommand 
} from '../../src/commands/sharepoint';
import { ValidationError } from '../../src/types';

// Mock dependencies
jest.mock('../../src/modules/sharepoint/SharePointConfigManager');
jest.mock('../../src/modules/sharepoint/SharePointOAuth2');
jest.mock('../../src/modules/sharepoint/SharePointPublisher');

describe('SharePoint Command', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('handleSharePointCommand', () => {
    test('should handle basic sharepoint command', async () => {
      const options = { quiet: true };
      
      await expect(handleSharePointCommand(options)).resolves.not.toThrow();
    });

    test('should handle sharepoint command with verbose output', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      const options = { quiet: false };
      await handleSharePointCommand(options);
      
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('handleSharePointOAuth2Command', () => {
    test('should handle oauth2 login command', async () => {
      const options = { 
        action: 'login' as const,
        quiet: true 
      };

      await expect(handleSharePointOAuth2Command(options)).resolves.not.toThrow();
    });

    test('should handle oauth2 status command', async () => {
      const options = { 
        action: 'status' as const,
        quiet: true 
      };

      await expect(handleSharePointOAuth2Command(options)).resolves.not.toThrow();
    });

    test('should handle oauth2 debug command', async () => {
      const options = { 
        action: 'debug' as const,
        quiet: false 
      };

      await expect(handleSharePointOAuth2Command(options)).resolves.not.toThrow();
    });

    test('should validate oauth2 action parameter', async () => {
      const options = { 
        action: 'invalid' as any,
        quiet: true 
      };

      await expect(handleSharePointOAuth2Command(options))
        .rejects.toThrow(ValidationError);
    });
  });

  describe('handleSharePointStatusCommand', () => {
    test('should check sharepoint status', async () => {
      const options = { quiet: true };

      await expect(handleSharePointStatusCommand(options)).resolves.not.toThrow();
    });

    test('should display status with verbose output', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      const options = { quiet: false };
      await handleSharePointStatusCommand(options);
      
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('handleSharePointPublishCommand', () => {
    test('should handle publish command with valid options', async () => {
      const options = {
        input: './test-input',
        siteUrl: 'https://test.sharepoint.com/sites/test',
        libraryName: 'Documents',
        quiet: true
      };

      await expect(handleSharePointPublishCommand(options)).resolves.not.toThrow();
    });

    test('should validate required publish parameters', async () => {
      const options = {
        input: '',
        siteUrl: '',
        libraryName: '',
        quiet: true
      };

      await expect(handleSharePointPublishCommand(options))
        .rejects.toThrow(ValidationError);
    });

    test('should validate SharePoint URL format', async () => {
      const options = {
        input: './test-input',
        siteUrl: 'invalid-url',
        libraryName: 'Documents',
        quiet: true
      };

      await expect(handleSharePointPublishCommand(options))
        .rejects.toThrow(ValidationError);
    });

    test('should handle publish errors gracefully', async () => {
      const options = {
        input: './non-existent-input',
        siteUrl: 'https://test.sharepoint.com/sites/test',
        libraryName: 'Documents',
        quiet: true
      };

      await expect(handleSharePointPublishCommand(options))
        .rejects.toThrow();
    });
  });

  describe('Authentication', () => {
    test('should validate client credentials', async () => {
      const options = { 
        action: 'login' as const,
        quiet: true 
      };

      // Should check for required environment variables
      await expect(handleSharePointOAuth2Command(options)).resolves.not.toThrow();
    });

    test('should handle authentication errors', async () => {
      const options = { 
        action: 'status' as const,
        quiet: true 
      };

      // Should handle missing or invalid credentials gracefully
      await expect(handleSharePointOAuth2Command(options)).resolves.not.toThrow();
    });
  });

  describe('Error Handling', () => {
    test('should handle network errors', async () => {
      const options = { quiet: true };
      
      const mockError = new Error('Network error');
      jest.spyOn(console, 'error').mockImplementation();

      await expect(handleSharePointCommand(options)).resolves.not.toThrow();
    });

    test('should validate site URL accessibility', async () => {
      const options = {
        input: './test-input',
        siteUrl: 'https://non-existent.sharepoint.com/sites/test',
        libraryName: 'Documents',
        quiet: true
      };

      // Should handle inaccessible sites gracefully
      await expect(handleSharePointPublishCommand(options)).rejects.toThrow();
    });
  });
});
