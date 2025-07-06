/**
 * Unit Tests for Generate Command
 * Tests the generate command module independently with mocked dependencies
 * Following CLI-REFACTOR-IMPLEMENTATION-GUIDE.md section 8 testing strategy
 */

import { handleGenerateCommand, handleGenerateCategoryCommand, handleGenerateAllCommand } from '../../src/commands/generate';
import { ValidationError } from '../../src/types';
import * as documentGenerator from '../../src/modules/documentGenerator';
import * as fileManager from '../../src/modules/fileManager';

// Mock dependencies
jest.mock('../../src/modules/documentGenerator');
jest.mock('../../src/modules/fileManager');
jest.mock('../../src/modules/documentGenerator/generationTasks');

const mockDocumentGenerator = documentGenerator as jest.Mocked<typeof documentGenerator>;
const mockFileManager = fileManager as jest.Mocked<typeof fileManager>;

describe('Generate Command', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock successful project context read
    mockFileManager.readEnhancedProjectContext = jest.fn().mockResolvedValue('mocked project context');
    
    // Mock successful task retrieval
    jest.mocked(documentGenerator.getTaskByKey).mockReturnValue({
      key: 'test-doc',
      name: 'Test Document',
      category: 'test',
      emoji: '📝',
      priority: 1
    });
  });

  describe('handleGenerateCommand', () => {
    test('should generate document with valid options', async () => {
      const options = {
        output: './test-output',
        format: 'markdown' as const,
        quiet: false,
        retries: 0
      };

      // Mock DocumentGenerator class
      const mockGenerator = {
        generateOne: jest.fn().mockResolvedValue(true)
      };
      jest.mocked(documentGenerator.DocumentGenerator).mockImplementation(() => mockGenerator as any);

      await expect(handleGenerateCommand('test-doc', options)).resolves.not.toThrow();
      expect(mockGenerator.generateOne).toHaveBeenCalledWith('test-doc');
    });

    test('should throw ValidationError for invalid document key', async () => {
      jest.mocked(documentGenerator.getTaskByKey).mockReturnValue(null);

      const options = {
        output: './test-output',
        format: 'markdown' as const,
        quiet: true,
        retries: 0
      };

      await expect(handleGenerateCommand('invalid-key', options)).rejects.toThrow(ValidationError);
    });

    test('should handle retry logic when retries > 0', async () => {
      const options = {
        output: './test-output',
        format: 'markdown' as const,
        quiet: false,
        retries: 3,
        retryBackoff: 1000,
        retryMaxDelay: 5000
      };

      mockDocumentGenerator.generateDocumentsWithRetry = jest.fn().mockResolvedValue({
        success: true,
        successCount: 1,
        failureCount: 0
      });

      await handleGenerateCommand('test-doc', options);
      
      expect(mockDocumentGenerator.generateDocumentsWithRetry).toHaveBeenCalledWith(
        'mocked project context',
        expect.objectContaining({
          maxRetries: 3,
          retryBackoff: 1000,
          retryMaxDelay: 5000
        })
      );
    });

    test('should suppress output when quiet option is true', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      const options = {
        output: './test-output',
        format: 'markdown' as const,
        quiet: true,
        retries: 0
      };

      const mockGenerator = {
        generateOne: jest.fn().mockResolvedValue(true)
      };
      jest.mocked(documentGenerator.DocumentGenerator).mockImplementation(() => mockGenerator as any);

      await handleGenerateCommand('test-doc', options);
      
      // Should not log anything when quiet is true
      expect(consoleSpy).not.toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });

  describe('handleGenerateCategoryCommand', () => {
    test('should generate all documents in category', async () => {
      const options = {
        output: './test-output',
        quiet: false,
        retries: 0
      };

      jest.mocked(documentGenerator.getTasksByCategory).mockReturnValue([
        { key: 'doc1', name: 'Doc 1', category: 'test', emoji: '📝', priority: 1 },
        { key: 'doc2', name: 'Doc 2', category: 'test', emoji: '📄', priority: 2 }
      ]);

      mockDocumentGenerator.generateAllDocuments = jest.fn().mockResolvedValue(undefined);

      await expect(handleGenerateCategoryCommand('test', options)).resolves.not.toThrow();
      expect(mockDocumentGenerator.generateAllDocuments).toHaveBeenCalledWith('mocked project context');
    });

    test('should use retry logic when retries specified', async () => {
      const options = {
        output: './test-output',
        quiet: false,
        retries: 2,
        retryBackoff: 500,
        retryMaxDelay: 3000
      };

      mockDocumentGenerator.generateDocumentsWithRetry = jest.fn().mockResolvedValue({
        success: true,
        successCount: 2,
        failureCount: 0
      });

      await handleGenerateCategoryCommand('test', options);
      
      expect(mockDocumentGenerator.generateDocumentsWithRetry).toHaveBeenCalledWith(
        'mocked project context',
        expect.objectContaining({
          includeCategories: ['test'],
          maxRetries: 2
        })
      );
    });
  });

  describe('handleGenerateAllCommand', () => {
    test('should generate all available documents', async () => {
      const options = {
        output: './test-output',
        quiet: false,
        retries: 0
      };

      mockDocumentGenerator.generateAllDocuments = jest.fn().mockResolvedValue(undefined);

      await expect(handleGenerateAllCommand(options)).resolves.not.toThrow();
      expect(mockDocumentGenerator.generateAllDocuments).toHaveBeenCalledWith('mocked project context');
    });

    test('should handle errors gracefully', async () => {
      const options = {
        output: './test-output',
        quiet: true,
        retries: 0
      };

      mockDocumentGenerator.generateAllDocuments = jest.fn().mockRejectedValue(new Error('Generation failed'));

      await expect(handleGenerateAllCommand(options)).rejects.toThrow('Generation failed');
    });
  });

  describe('Validation', () => {
    test('should validate output directory', async () => {
      // Mock validation to throw error for invalid directory
      const mockValidateOutputDir = jest.fn().mockRejectedValue(new ValidationError('Invalid output directory', 'output'));
      
      // We need to mock the validation function that's imported
      jest.doMock('../../src/utils/errorHandler', () => ({
        validateOutputDirectory: mockValidateOutputDir
      }));

      const options = {
        output: '/invalid/path',
        format: 'markdown' as const,
        quiet: true,
        retries: 0
      };

      await expect(handleGenerateCommand('test-doc', options)).rejects.toThrow(ValidationError);
    });
  });
});
