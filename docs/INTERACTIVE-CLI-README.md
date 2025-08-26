# Interactive CLI Menu System

## Overview

The ADPA Interactive CLI provides a Yeoman-style menu interface that makes it easy to discover and use all system features without memorizing command syntax. This user-friendly interface is perfect for both new users and experienced developers who want quick access to functionality.

## Quick Start

### Launch Interactive Mode

```bash
# Start interactive mode
adpa interactive

# Start in advanced mode
adpa interactive --mode advanced

# Skip intro message
adpa interactive --skip-intro

# Enable debug mode
adpa interactive --debug
```

### Basic Navigation

- **Number Keys**: Select menu options (1, 2, 3, etc.)
- **Enter**: Confirm selection
- **Ctrl+C**: Exit at any time
- **Back Options**: Return to previous menu
- **Home Options**: Return to main menu

## Menu Structure

### 🏠 Main Menu

The main menu provides access to all major system areas:

1. **🚀 Quick Start** - Common workflows for new users
2. **📝 Document Generation** - 120+ professional templates
3. **🤖 AI Configuration** - Multi-provider AI setup
4. **📊 Project Management** - Comprehensive PM tools
5. **🔗 Integrations** - External system connections
6. **📈 Analytics & Feedback** - Document insights
7. **⚙️ System Configuration** - Settings and preferences
8. **🔍 Workspace Analysis** - Project health check
9. **❓ Help & Documentation** - User assistance

### 🚀 Quick Start Menu

Perfect for getting started quickly:

- **New Project Setup** - Initialize a new project
- **Generate Core Documents** - Essential project documents
- **Project Charter Wizard** - Step-by-step charter creation
- **Stakeholder Analysis** - Analyze project stakeholders
- **Risk Assessment** - Perform risk analysis
- **Environment Setup** - Configure development environment
- **View Templates** - Browse available templates

### 📝 Document Generation Menu

Comprehensive document generation capabilities:

- **Browse by Category** - Organized template browsing
- **Search Templates** - Find specific templates
- **Generate Single Document** - Quick single document generation
- **Generate Category** - Bulk category generation
- **Generate All Documents** - Complete document set
- **Custom Generation** - Advanced generation options
- **Recent Documents** - View recently generated documents

## Document Categories

The system includes 120+ templates organized into categories:

### Core Categories
- **Core Analysis** (15 templates) - Essential project analysis
- **Strategic Statements** (8 templates) - Mission, vision, values
- **Project Charter** (3 templates) - Project foundation documents
- **Management Plans** (12 templates) - Comprehensive planning

### Specialized Categories
- **BABOK Documents** (9 templates) - Business analysis standards
- **DMBOK Documents** (15 templates) - Data management standards
- **PMBOK Documents** (8 templates) - Project management standards
- **Technical Design** (10 templates) - System architecture
- **Quality Assurance** (10 templates) - Testing and QA
- **Implementation Guides** (10 templates) - Development guidance

## Features

### 🎯 Context-Aware Interface

The menu system adapts based on your project state:

- **Configuration Status** - Shows what's configured vs. needs setup
- **Project State** - Displays project initialization status
- **Recent Activity** - Quick access to recent actions
- **Smart Recommendations** - Suggests next steps

### 📊 Real-Time Status

Status indicators show system health:

- **✅ Configured** - Feature is ready to use
- **⚠️ Setup Required** - Needs configuration
- **❌ Error** - Requires attention
- **📊 Metrics** - Usage statistics and counts

### 🔍 Smart Search

Find templates and features quickly:

- **Template Search** - Search across all 120+ templates
- **Category Filtering** - Filter by document type
- **Dependency Tracking** - Shows template prerequisites
- **Recent Items** - Quick access to recently used items

## AI Provider Configuration

### Supported Providers

The interactive menu supports multiple AI providers:

1. **🟢 Google AI (Gemini)** - Google's Gemini models
2. **🔵 Azure OpenAI** - Microsoft Azure OpenAI service
3. **⚫ GitHub Models** - GitHub's AI model marketplace
4. **🟠 Ollama** - Local AI model hosting

### Configuration Wizard

The AI configuration menu provides:

- **Provider Setup** - Step-by-step configuration
- **Connection Testing** - Verify provider connectivity
- **API Key Management** - Secure credential handling
- **Usage Analytics** - Monitor API usage and costs
- **Advanced Settings** - Fine-tune provider behavior

## Project Management Tools

### Stakeholder Management

Comprehensive stakeholder analysis tools:

- **Stakeholder Register** - Identify and catalog stakeholders
- **Stakeholder Analysis** - Analyze influence and interest
- **Engagement Planning** - Plan stakeholder interactions
- **Automated Analysis** - AI-powered stakeholder insights

### Risk & Compliance

Advanced risk management capabilities:

- **Risk Assessment** - Identify and analyze project risks
- **Compliance Validation** - Ensure regulatory compliance
- **PMBOK Validation** - Verify project management standards
- **Automated Reporting** - Generate compliance reports

## Integration Management

### Supported Integrations

Connect with external systems:

- **🌐 Confluence** - Atlassian Confluence integration
- **📊 SharePoint** - Microsoft SharePoint integration
- **🔄 Version Control** - Git repository management
- **🎨 Adobe Creative Suite** - Professional document design
- **☁️ Cloud Storage** - Various cloud storage providers

### Integration Setup

Each integration provides:

- **Setup Wizard** - Guided configuration process
- **Connection Testing** - Verify integration health
- **OAuth2 Authentication** - Secure authentication flow
- **Status Monitoring** - Real-time integration status
- **Troubleshooting** - Debug connection issues

## Analytics & Feedback

### Document Analytics

Comprehensive document insights:

- **Usage Patterns** - Track document generation trends
- **Quality Metrics** - Measure document quality
- **Performance Analytics** - Monitor generation performance
- **User Feedback** - Collect and analyze user feedback

### Feedback Management

Advanced feedback system:

- **Feedback Collection** - Gather user input
- **Pattern Analysis** - Identify improvement opportunities
- **Recommendation Engine** - AI-powered suggestions
- **Quality Improvements** - Apply feedback-driven enhancements

## System Configuration

### General Settings

Customize system behavior:

- **Output Configuration** - Set default output directories
- **Template Management** - Manage custom templates
- **Performance Tuning** - Optimize system performance
- **Security Settings** - Configure security preferences

### Maintenance Tools

Keep your system healthy:

- **Backup & Restore** - Protect your configurations
- **Health Checks** - Monitor system health
- **Cache Management** - Optimize performance
- **Log Management** - Review system logs

## Workspace Analysis

### Project Health Check

Comprehensive workspace analysis:

- **Project Overview** - High-level project status
- **File Structure Analysis** - Validate project structure
- **Configuration Status** - Check all configurations
- **Document Coverage** - Assess documentation completeness
- **Issue Detection** - Identify potential problems
- **Recommendations** - Suggest improvements

## Help & Documentation

### User Assistance

Comprehensive help system:

- **User Guide** - Complete system documentation
- **Getting Started** - Quick start tutorials
- **Template Reference** - Detailed template documentation
- **Troubleshooting** - Common issues and solutions
- **Tips & Best Practices** - Expert recommendations
- **Support Information** - Contact and support details

## Advanced Features

### Keyboard Shortcuts

Efficient navigation options:

- **Number Keys** - Quick menu selection
- **Arrow Keys** - Navigate menu items (future enhancement)
- **Tab/Shift+Tab** - Move between sections (future enhancement)
- **Escape** - Go back to previous menu (future enhancement)

### Customization

Personalize your experience:

- **Menu Layouts** - Customize menu organization (future)
- **Favorite Actions** - Quick access to frequent tasks (future)
- **Role-based Menus** - Different views for different roles (future)
- **Theme Options** - Customize visual appearance (future)

## Troubleshooting

### Common Issues

**Interactive mode not starting:**
- Ensure you're in an interactive terminal (TTY)
- Check that Node.js readline module is available
- Try running with `--debug` flag for more information

**Menu navigation issues:**
- Use number keys to select options
- Ensure terminal supports interactive input
- Check terminal size (minimum 80 columns recommended)

**Configuration problems:**
- Run workspace analysis to identify issues
- Use the setup wizard to reconfigure
- Check file permissions in project directory

### Debug Mode

Enable debug mode for troubleshooting:

```bash
adpa interactive --debug
```

Debug mode provides:
- Detailed error messages
- System state information
- Configuration validation details
- Performance metrics

## Best Practices

### For New Users

1. **Start with Quick Start** - Use the Quick Start menu for common workflows
2. **Use the Setup Wizard** - Configure AI providers before generating documents
3. **Browse Templates** - Explore available templates to understand capabilities
4. **Check Status Regularly** - Monitor system status indicators

### For Advanced Users

1. **Use Advanced Mode** - Enable advanced mode for more options
2. **Customize Configuration** - Fine-tune settings for your workflow
3. **Leverage Integrations** - Connect with external systems for enhanced workflow
4. **Monitor Analytics** - Use analytics to optimize document generation

### For Teams

1. **Standardize Configuration** - Use consistent settings across team members
2. **Share Templates** - Develop and share custom templates
3. **Monitor Usage** - Track team usage patterns and optimize workflows
4. **Provide Training** - Ensure team members understand the system

## API and Extensibility

### Plugin System (Future)

The interactive menu system is designed for extensibility:

- **Custom Menu Items** - Add organization-specific options
- **Integration Plugins** - Connect with proprietary systems
- **Template Plugins** - Add custom document templates
- **Analytics Plugins** - Custom reporting and analytics

### Configuration API

Programmatic configuration management:

- **Configuration Export/Import** - Share configurations
- **Automated Setup** - Script-based configuration
- **Validation API** - Programmatic validation
- **Status API** - Monitor system status programmatically

## Support and Community

### Getting Help

- **Documentation** - Comprehensive docs in `/docs` directory
- **Examples** - Sample configurations and workflows
- **Issues** - Report bugs and request features on GitHub
- **Discussions** - Community discussions and Q&A

### Contributing

- **Feature Requests** - Suggest new menu features
- **Bug Reports** - Report issues with detailed information
- **Documentation** - Help improve documentation
- **Code Contributions** - Submit pull requests for enhancements

## Version History

### v1.0.0 (Current)
- Initial interactive menu system
- Main menu with 9 major sections
- Document generation with 120+ templates
- AI provider configuration
- Basic integrations support
- Workspace analysis tools

### Future Versions
- Enhanced keyboard navigation
- Customizable menu layouts
- Plugin system for extensibility
- Advanced analytics dashboard
- Team collaboration features

---

For more information, see the complete documentation in the `/docs` directory or visit the project repository.