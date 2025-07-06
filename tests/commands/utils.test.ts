/**
 * Unit Tests for Command Utils
 * Tests shared command utilities and validation functions
 * Following CLI-REFACTOR-IMPLEMENTATION-GUIDE.md section 8 testing strategy
 */

import { ValidationError, validateOutputDirectory, validateFormat, validateRetryCount, validateUrl } from '../../src/commands/utils/validation';
import { getPackageVersion, formatDuration, createProgressIndicator, isQuietMode } from '../../src/commands/utils/common';

describe('Command Utils', () => {
  describe('Validation Utils', () => {
    describe('validateOutputDirectory', () => {
      test('should accept valid directory paths', () => {
        expect(() => validateOutputDirectory('./test-dir')).not.toThrow();
        expect(() => validateOutputDirectory('generated-documents')).not.toThrow();
        expect(() => validateOutputDirectory('/tmp/output')).not.toThrow();
      });

      test('should reject empty or invalid directory paths', () => {
        expect(() => validateOutputDirectory('')).toThrow(ValidationError);
        expect(() => validateOutputDirectory(null as any)).toThrow(ValidationError);
        expect(() => validateOutputDirectory(undefined as any)).toThrow(ValidationError);
      });

      test('should reject paths with ".." segments', () => {
        expect(() => validateOutputDirectory('../dangerous-path')).toThrow(ValidationError);
        expect(() => validateOutputDirectory('./test/../other')).toThrow(ValidationError);
      });
    });

    describe('validateFormat', () => {
      test('should accept supported formats', () => {
        expect(() => validateFormat('markdown')).not.toThrow();
        expect(() => validateFormat('json')).not.toThrow();
        expect(() => validateFormat('yaml')).not.toThrow();
      });

      test('should reject unsupported formats', () => {
        expect(() => validateFormat('xml')).toThrow(ValidationError);
        expect(() => validateFormat('invalid')).toThrow(ValidationError);
        expect(() => validateFormat('')).toThrow(ValidationError);
      });
    });

    describe('validateRetryCount', () => {
      test('should accept valid retry counts', () => {
        expect(() => validateRetryCount(0)).not.toThrow();
        expect(() => validateRetryCount(5)).not.toThrow();
        expect(() => validateRetryCount(10)).not.toThrow();
      });

      test('should reject negative retry counts', () => {
        expect(() => validateRetryCount(-1)).toThrow(ValidationError);
        expect(() => validateRetryCount(-10)).toThrow(ValidationError);
      });

      test('should reject non-integer retry counts', () => {
        expect(() => validateRetryCount(1.5)).toThrow(ValidationError);
        expect(() => validateRetryCount(NaN)).toThrow(ValidationError);
      });
    });
  });

  describe('Common Utils', () => {
    describe('getPackageVersion', () => {
      test('should return a version string', () => {
        const version = getPackageVersion();
        expect(typeof version).toBe('string');
        expect(version === 'unknown' || /^\d+\.\d+\.\d+/.test(version)).toBe(true);
      });
    });

    describe('formatDuration', () => {
      test('should format milliseconds correctly', () => {
        expect(formatDuration(500)).toBe('500ms');
        expect(formatDuration(1000)).toBe('1s');
        expect(formatDuration(1500)).toBe('1s');
        expect(formatDuration(60000)).toBe('1m');
        expect(formatDuration(90000)).toBe('1m 30s');
      });

      test('should handle edge cases', () => {
        expect(formatDuration(0)).toBe('0ms');
        expect(formatDuration(999)).toBe('999ms');
        expect(formatDuration(3661000)).toContain('1h');
      });
    });

    describe('createProgressIndicator', () => {
      test('should create progress indicators correctly', () => {
        expect(createProgressIndicator(0, 100)).toContain('0%');
        expect(createProgressIndicator(50, 100)).toContain('50%');
        expect(createProgressIndicator(100, 100)).toContain('100%');
      });

      test('should include description when provided', () => {
        const progress = createProgressIndicator(25, 100, 'Processing files');
        expect(progress).toContain('Processing files');
        expect(progress).toContain('25%');
      });
    });

    describe('isQuietMode', () => {
      test('should return boolean value', () => {
        const isQuiet = isQuietMode();
        expect(typeof isQuiet).toBe('boolean');
      });
    });
  });

  describe('ValidationError', () => {
    test('should create proper error instances', () => {
      const error = new ValidationError('Test validation message');
      
      expect(error).toBeInstanceOf(ValidationError);
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Test validation message');
      expect(error.name).toBe('ValidationError');
    });

    test('should maintain stack trace', () => {
      const error = new ValidationError('Test error');
      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('ValidationError');
    });
  });

  describe('Integration Tests', () => {
    test('should validate and format together', () => {
      // Test that validation passes for valid input
      expect(() => {
        validateOutputDirectory('./output');
        validateFormat('markdown');
        validateRetryCount(3);
      }).not.toThrow();
    });

    test('should handle validation failures gracefully', () => {
      expect(() => {
        validateOutputDirectory('../invalid');
      }).toThrow(ValidationError);

      expect(() => {
        validateFormat('invalid-format');
      }).toThrow(ValidationError);

      expect(() => {
        validateRetryCount(-1);
      }).toThrow(ValidationError);
    });

    test('should work with realistic CLI scenarios', () => {
      // Simulate typical CLI validation workflow
      const options = {
        output: './generated-documents',
        format: 'markdown',
        retries: 3
      };

      expect(() => {
        validateOutputDirectory(options.output);
        validateFormat(options.format);
        validateRetryCount(options.retries);
      }).not.toThrow();

      const version = getPackageVersion();
      expect(typeof version).toBe('string');

      const duration = formatDuration(5000);
      expect(duration).toBe('5s');
    });
  });
});
