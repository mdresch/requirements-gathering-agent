#!/usr/bin/env node

/**
 * Demo of Enhanced Input Validation and Error Handling
 * 
 * This script demonstrates the key validation concepts implemented
 * in the enhanced CLI system.
 */

console.log('🧪 Enhanced Input Validation and Error Handling Demo\n');

// Simulate the validation logic
function validateMenuChoice(input, validChoices) {
  const trimmed = input.trim();
  
  if (!trimmed) {
    return {
      isValid: false,
      error: 'Please enter a choice',
      suggestions: ['Enter a number from the menu options', 'Type "help" for navigation commands']
    };
  }

  // Check for special navigation commands (case-insensitive)
  const navigationCommands = ['back', 'b', 'home', 'h', 'help', '?', 'exit', 'quit', 'q', 'status', 's', 'refresh', 'r'];
  const lowerInput = trimmed.toLowerCase();
  
  if (navigationCommands.includes(lowerInput)) {
    return {
      isValid: true,
      sanitizedValue: lowerInput
    };
  }

  // Check if it's a valid menu choice
  if (validChoices.includes(trimmed)) {
    return {
      isValid: true,
      sanitizedValue: trimmed
    };
  }

  return {
    isValid: false,
    error: `Invalid choice "${trimmed}"`,
    suggestions: [
      `Valid choices: ${validChoices.join(', ')}`,
      'Navigation commands: back, home, help, exit, status, refresh'
    ]
  };
}

function validateProjectName(input) {
  const trimmed = input.trim();
  
  if (!trimmed) {
    return {
      isValid: false,
      error: 'Project name cannot be empty',
      suggestions: ['Enter a project name (3-50 characters)', 'Use letters, numbers, hyphens, and underscores only']
    };
  }

  if (trimmed.length < 3) {
    return {
      isValid: false,
      error: 'Project name must be at least 3 characters long',
      suggestions: ['Use a longer name', 'Example: my-project-name']
    };
  }

  if (trimmed.length > 50) {
    return {
      isValid: false,
      error: 'Project name must be 50 characters or less',
      suggestions: ['Use a shorter name', 'Abbreviate if necessary']
    };
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
    return {
      isValid: false,
      error: 'Project name can only contain letters, numbers, hyphens, and underscores',
      suggestions: ['Remove spaces and special characters', 'Example: my-project-name']
    };
  }

  return {
    isValid: true,
    sanitizedValue: trimmed
  };
}

function sanitizeInputSecure(input) {
  if (!input || typeof input !== 'string') {
    return '';
  }

  return input
    .trim()
    // Remove potential script injection attempts
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove null bytes
    .replace(/\0/g, '')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    // Limit length to prevent buffer overflow
    .substring(0, 1000);
}

function formatValidationError(result) {
  let message = `❌ ${result.error}`;
  
  if (result.suggestions && result.suggestions.length > 0) {
    message += '\n💡 Suggestions:';
    for (const suggestion of result.suggestions) {
      message += `\n   • ${suggestion}`;
    }
  }
  
  return message;
}

// Test demonstrations
console.log('📋 Test 1: Menu Choice Validation');
console.log('─'.repeat(50));

const validChoices = ['1', '2', '3', '4', '5'];
const testInputs = [
  { input: '1', description: 'Valid numeric choice' },
  { input: 'back', description: 'Valid navigation command' },
  { input: 'help', description: 'Valid help command' },
  { input: '99', description: 'Invalid numeric choice' },
  { input: '', description: 'Empty input' },
  { input: 'invalid', description: 'Invalid text input' }
];

testInputs.forEach(test => {
  const result = validateMenuChoice(test.input, validChoices);
  const status = result.isValid ? '✅' : '❌';
  console.log(`${status} ${test.description}: "${test.input}"`);
  if (!result.isValid) {
    console.log(`   ${formatValidationError(result)}`);
  }
  console.log('');
});

console.log('📋 Test 2: Project Name Validation');
console.log('─'.repeat(50));

const projectNameTests = [
  { input: 'my-project', description: 'Valid project name with hyphen' },
  { input: 'MyProject123', description: 'Valid alphanumeric project name' },
  { input: 'ab', description: 'Too short (less than 3 characters)' },
  { input: 'a'.repeat(51), description: 'Too long (more than 50 characters)' },
  { input: 'project with spaces', description: 'Contains spaces' },
  { input: 'project@special', description: 'Contains special characters' }
];

projectNameTests.forEach(test => {
  const result = validateProjectName(test.input);
  const status = result.isValid ? '✅' : '❌';
  console.log(`${status} ${test.description}: "${test.input}"`);
  if (!result.isValid) {
    console.log(`   ${formatValidationError(result)}`);
  }
  console.log('');
});

console.log('📋 Test 3: Input Sanitization');
console.log('─'.repeat(50));

const sanitizationTests = [
  { input: '  normal input  ', description: 'Trim whitespace' },
  { input: '<script>alert("test")</script>text', description: 'Remove script tags' },
  { input: '<div>content</div>', description: 'Remove HTML tags' },
  { input: 'multiple   spaces', description: 'Normalize whitespace' }
];

sanitizationTests.forEach(test => {
  const result = sanitizeInputSecure(test.input);
  console.log(`✅ ${test.description}:`);
  console.log(`   Input:  "${test.input}"`);
  console.log(`   Output: "${result}"`);
  console.log('');
});

console.log('🎉 Enhanced Input Validation Demo Completed!\n');

console.log('📊 Key Features Demonstrated:');
console.log('✅ Menu choice validation with navigation commands');
console.log('✅ Project name validation with comprehensive checks');
console.log('✅ Input sanitization preventing malicious content');
console.log('✅ Clear error messages with helpful suggestions');
console.log('✅ Graceful error handling without crashes');

console.log('\n💡 Benefits:');
console.log('• Invalid input is detected and reported clearly');
console.log('• Errors provide helpful feedback to users');
console.log('• Security measures prevent injection attacks');
console.log('• Robust validation prevents CLI crashes');
console.log('• User-friendly suggestions guide correct input');

console.log('\n🔒 Security Enhancements:');
console.log('• Script injection prevention');
console.log('• HTML tag removal');
console.log('• Input length limits');
console.log('• Character validation');
console.log('• Null byte removal');

console.log('\n🚀 User Experience Improvements:');
console.log('• Clear validation error messages');
console.log('• Contextual suggestions for corrections');
console.log('• Support for navigation shortcuts');
console.log('• Consistent error formatting');
console.log('• Non-blocking error handling');