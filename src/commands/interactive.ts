/**
 * Interactive CLI Command
 * 
 * Provides the interactive menu interface for the ADPA CLI.
 * This command launches the Yeoman-style interactive menu system.
 * 
 * @version 1.0.0
 * @author ADPA Team
 */

import { startInteractiveMenu } from '../modules/cli/InteractiveMenuSystem.js';

export interface InteractiveOptions {
  mode?: 'beginner' | 'advanced';
  skipIntro?: boolean;
  debug?: boolean;
}

/**
 * Handle the interactive command
 */
export async function handleInteractiveCommand(options: InteractiveOptions = {}): Promise<void> {
  try {
    // Show intro message unless skipped
    if (!options.skipIntro) {
      showIntroMessage();
    }

    // Set debug mode if requested
    if (options.debug) {
      process.env.DEBUG = 'true';
    }

    // Start the interactive menu system
    await startInteractiveMenu();
    
  } catch (error) {
    if (error instanceof Error) {
      console.error('❌ Error starting interactive mode:', error.message);
    } else {
      console.error('❌ Error starting interactive mode:', error);
    }
    if (options.debug) {
      console.error('Debug info:', error);
    }
    
    console.log('\n💡 Try running with --debug flag for more information');
    process.exit(1);
  }
}

/**
 * Show introduction message
 */
function showIntroMessage(): void {
  console.log(`
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│              Welcome to ADPA Interactive CLI!              │
│                                                             │
│  🚀 Quick Start: Get up and running in minutes             │
│  📝 Document Generation: 120+ professional templates       │
│  🤖 AI Integration: Multiple AI providers supported        │
│  📊 Project Management: Comprehensive PM tools             │
│  🔗 Integrations: Confluence, SharePoint, and more         │
│                                                             │
│  💡 Tip: Use arrow keys to navigate, Enter to select       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
`);
  
  console.log('🎯 Starting interactive mode...\n');
}

/**
 * Show help for the interactive command
 */
export function showInteractiveHelp(): void {
  console.log(`
Interactive CLI Command Help
───────────────────────────

USAGE:
  adpa interactive [options]

OPTIONS:
  --mode <mode>     Set interface mode (beginner|advanced)
  --skip-intro      Skip the introduction message
  --debug           Enable debug mode for troubleshooting
  --help, -h        Show this help message

EXAMPLES:
  adpa interactive                    # Start interactive mode
  adpa interactive --mode advanced    # Start in advanced mode
  adpa interactive --skip-intro       # Skip intro and start directly
  adpa interactive --debug            # Start with debug information

DESCRIPTION:
  The interactive command launches a Yeoman-style menu interface that provides
  easy access to all ADPA functionality through a hierarchical menu system.
  
  This is the recommended way to use ADPA for new users or when you want to
  explore available features without memorizing command syntax.

FEATURES:
  • Hierarchical menu navigation
  • Context-aware options
  • Real-time status indicators
  • Integrated help system
  • Quick access to common workflows
  • Template browsing and search
  • Configuration management
  • System health monitoring

NAVIGATION:
  • Use number keys to select menu options
  • Type 'back' or 'b' to go to previous menu
  • Type 'home' or 'h' to return to main menu
  • Type 'exit' or 'q' to quit the application
  • Use Ctrl+C to force quit at any time

For more information, visit: https://github.com/your-org/adpa
`);
}

/**
 * Validate interactive command options
 */
export function validateInteractiveOptions(options: InteractiveOptions): void {
  if (options.mode && !['beginner', 'advanced'].includes(options.mode)) {
    throw new Error('Invalid mode. Must be "beginner" or "advanced"');
  }
}

/**
 * Get default interactive options
 */
export function getDefaultInteractiveOptions(): InteractiveOptions {
  return {
    mode: 'beginner',
    skipIntro: false,
    debug: false
  };
}

/**
 * Check if interactive mode is supported in current environment
 */
export function checkInteractiveSupport(): boolean {
  // Check if we're in a TTY (interactive terminal)
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    return false;
  }

  // Check if required modules are available
  try {
    require('readline');
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Show interactive mode not supported message
 */
export function showInteractiveNotSupportedMessage(): void {
  console.log(`
❌ Interactive mode is not supported in this environment.

This can happen when:
• Running in a non-interactive terminal (CI/CD, scripts)
• Terminal doesn't support TTY
• Required modules are not available

💡 Alternative options:
• Use standard CLI commands: adpa --help
• Run in an interactive terminal
• Use the web interface if available

For more information, see: adpa help
`);
}

export default {
  handleInteractiveCommand,
  showInteractiveHelp,
  validateInteractiveOptions,
  getDefaultInteractiveOptions,
  checkInteractiveSupport,
  showInteractiveNotSupportedMessage
};