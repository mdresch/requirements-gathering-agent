# CLI Integration Documentation

## Overview

This document describes the integration between the interactive CLI menu system and existing yargs command handlers, ensuring seamless execution of commands from the menu interface.

## Architecture

### Command Integration Service

The `CommandIntegrationService` (`src/modules/cli/CommandIntegration.ts`) serves as the bridge between the interactive menu system and existing CLI command handlers.

#### Key Components:

1. **Command Routing**: Maps menu commands to appropriate command handlers
2. **Argument Parsing**: Converts menu arguments to command options
3. **Error Handling**: Provides consistent error handling across all commands
4. **Direct Execution**: Executes commands directly without spawning child processes

### Interactive Menu System

The `InteractiveMenuSystem` (`src/modules/cli/InteractiveMenuSystem.ts`) provides the user interface and integrates with the command service.

#### Integration Points:

1. **Menu Actions**: Three types of actions supported:
   - `navigate`: Navigate to another menu
   - `function`: Execute internal functions
   - `command`: Execute CLI commands via CommandIntegrationService

2. **Command Execution**: Uses `CommandIntegrationService.executeCommand()` for all CLI operations

## Supported Commands

### Document Generation Commands
- `generate <template>` - Generate single document
- `generate-category <category>` - Generate all documents in category
- `generate-all` - Generate all available documents
- `generate-core-analysis` - Generate core analysis documents
- `list-templates` - List available templates

### Analysis Commands
- `analyze [workspace]` - Analyze workspace
- `status` - Show system status
- `validate` - Validate documents

### Setup Commands
- `setup` - Interactive setup wizard

### Stakeholder Commands
- `stakeholder analysis` - Generate stakeholder analysis
- `stakeholder register` - Generate stakeholder register
- `stakeholder engagement-plan` - Generate engagement plan
- `stakeholder automate` - Generate all stakeholder documents

### Business Analysis Commands
- `business-analysis <subcommand>` - Various business analysis operations

### Risk & Compliance Commands
- `risk-compliance` - Generate risk and compliance assessments

### Feedback Commands
- `feedback <subcommand>` - Manage document feedback and improvements

### Integration Commands
- `confluence <subcommand>` - Confluence integration operations
- `sharepoint <subcommand>` - SharePoint integration operations
- `vcs <subcommand>` - Version control operations

## Menu Configuration

### Menu Structure

Menus are defined in the `initializeMenus()` method with the following structure:

```typescript
{
  id: 'menu-id',
  title: 'Menu Title',
  showBreadcrumb: true,
  showStatusBar: true,
  parent: 'parent-menu-id',
  items: [
    {
      key: '1',
      label: 'Option Label',
      icon: '🔧',
      description: 'Option description',
      enabled: true,
      action: { 
        type: 'command', 
        command: 'setup', 
        args: ['--provider', 'google-ai'] 
      }
    }
  ]
}
```

### Action Types

1. **Navigate Action**:
   ```typescript
   { type: 'navigate', target: 'target-menu-id' }
   ```

2. **Function Action**:
   ```typescript
   { type: 'function', handler: 'functionName' }
   ```

3. **Command Action**:
   ```typescript
   { type: 'command', command: 'commandName', args: ['--option', 'value'] }
   ```

## Error Handling

### Command Execution Errors

The integration provides comprehensive error handling:

1. **Validation Errors**: Input validation using `InputValidationService`
2. **Command Errors**: Proper error reporting from command execution
3. **Recovery Actions**: User-friendly error recovery options

### Error Recovery

Users can choose from several recovery actions when errors occur:
- `retry` - Try the operation again
- `back` - Return to previous menu
- `help` - Show help information
- `exit` - Exit the application

## Implementation Details

### Command Execution Flow

1. User selects menu option
2. Menu system validates input
3. Action is routed to appropriate handler
4. For command actions:
   - `CommandIntegrationService.executeCommand()` is called
   - Arguments are parsed and validated
   - Command handler is executed directly
   - Results are displayed to user
5. User is returned to menu or navigated as appropriate

### Argument Parsing

The service parses command-line style arguments:

```typescript
// Input: ['--project', 'myproject', '--type', 'SOFTWARE_DEVELOPMENT']
// Output: { project: 'myproject', type: 'SOFTWARE_DEVELOPMENT' }
```

### Direct Command Execution

Commands are executed directly without spawning child processes:

```typescript
// Before (problematic):
spawn('node', ['dist/cli.js', command, ...args])

// After (integrated):
await this.commandIntegration.executeCommand(command, args)
```

## Testing

### Manual Testing

1. Start interactive CLI: `npm run cli interactive`
2. Navigate through menus
3. Execute various commands
4. Verify error handling

### Integration Testing

The integration maintains compatibility with existing CLI functionality:
- All existing commands work unchanged
- Menu commands execute the same logic as direct CLI calls
- Error handling is consistent

## Benefits

### For Users
- Seamless experience between menu and CLI
- Consistent error handling
- No regression in existing functionality
- Enhanced discoverability of commands

### For Developers
- Single source of truth for command logic
- Easier maintenance and testing
- Consistent error handling patterns
- Reduced code duplication

## Future Enhancements

### Planned Improvements
1. **Command History**: Track and replay recent commands
2. **Favorites**: Allow users to bookmark frequently used commands
3. **Batch Operations**: Execute multiple commands in sequence
4. **Command Validation**: Pre-validate commands before execution

### Extension Points
- New commands can be easily added to both CLI and menu
- Custom validation rules can be implemented
- Additional error recovery strategies can be added

## Troubleshooting

### Common Issues

1. **Command Not Found**:
   - Ensure command is properly imported in `CommandIntegrationService`
   - Check command name spelling in menu configuration

2. **Argument Parsing Issues**:
   - Verify argument format in menu action
   - Check command handler parameter expectations

3. **Error Handling**:
   - Ensure proper error types are thrown
   - Verify error recovery actions are appropriate

### Debug Mode

Enable debug mode for detailed logging:
```bash
npm run cli interactive --debug
```

## Conclusion

The CLI integration provides a seamless bridge between the interactive menu system and existing command handlers, ensuring users can access all CLI functionality through an intuitive menu interface while maintaining full compatibility with direct CLI usage.