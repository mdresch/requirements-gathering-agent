/**
 * Command Integration Service
 * 
 * Provides seamless integration between the interactive CLI menu system
 * and existing yargs command handlers. This service maps menu actions
 * to command handlers and executes them directly without spawning child processes.
 * 
 * @version 1.0.0
 * @author ADPA Team
 */

import { 
  handleGenerateCommand,
  handleGenerateCategoryCommand,
  handleGenerateAllCommand,
  handleGenerateCoreAnalysisCommand,
  handleListTemplatesCommand
} from '../../commands/generate.js';

import {
  handleStakeholderAnalysisCommand,
  handleStakeholderRegisterCommand,
  handleStakeholderEngagementPlanCommand,
  handleStakeholderAutomationCommand
} from '../../commands/stakeholder.js';

import {
  handleStatusCommand,
  handleAnalyzeCommand,
  handleSetupCommand,
  handleValidateCommand
} from '../../commands/index.js';

import {
  handleInterviewQuestionsCommand,
  handleWorkshopPlanCommand,
  handleRequirementsExtractionCommand,
  handleProcessModelCommand,
  handleUseCaseModelCommand,
  handleBusinessRulesCommand,
  handleImpactAnalysisCommand,
  handleQualityAssessmentCommand,
  handleConsistencyValidationCommand,
  handleQualityMetricsCommand,
  displayBusinessAnalysisHelp
} from '../../commands/business-analysis.js';

import {
  handleConfluenceInitCommand,
  handleConfluenceTestCommand,
  handleConfluencePublishCommand,
  handleConfluenceStatusCommand
} from '../../commands/confluence.js';

import {
  handleSharePointInitCommand,
  handleSharePointTestCommand,
  handleSharePointPublishCommand,
  handleSharePointStatusCommand
} from '../../commands/sharepoint.js';

import {
  handleVcsInitCommand,
  handleVcsStatusCommand,
  handleVcsCommitCommand,
  handleVcsPushCommand
} from '../../commands/vcs.js';

import {
  handleStrategicPlanningCommand,
  handleRequirementsGenerationCommand,
  handleTechnologyAnalysisCommand,
  handleRiskManagementCommand,
  handleComprehensiveAnalysisCommand
} from '../../commands/user-stories.js';


import { DEFAULT_OUTPUT_DIR } from '../../constants.js';

export interface CommandExecutionResult {
  success: boolean;
  message?: string;
  error?: Error;
}

export interface CommandOptions {
  [key: string]: any;
}

/**
 * Command Integration Service
 * Maps interactive menu commands to actual command handlers
 */
export class CommandIntegrationService {
  
  /**
   * Execute a command with the given arguments
   */
  async executeCommand(command: string, args: string[] = []): Promise<CommandExecutionResult> {
    try {
      console.log(`🔄 Executing: ${command} ${args.join(' ')}`);
      
      // Parse arguments into options
      const options = this.parseArguments(args);
      
      // Route to appropriate command handler
      switch (command) {
        // Generate commands
        case 'generate':
          await this.handleGenerate(args, options);
          break;
        case 'generate-category':
          await this.handleGenerateCategory(args, options);
          break;
        case 'generate-all':
          await this.handleGenerateAll(options);
          break;
        case 'generate-core-analysis':
          await this.handleGenerateCoreAnalysis(options);
          break;
        case 'list-templates':
          await this.handleListTemplates();
          break;
          
        // Analysis commands
        case 'analyze':
          await this.handleAnalyze(args, options);
          break;
        case 'status':
          await this.handleStatus(options);
          break;
        case 'validate':
          await this.handleValidate(options);
          break;
          
        // Setup commands
        case 'setup':
          await this.handleSetup(options);
          break;
          
        // Stakeholder commands
        case 'stakeholder':
          await this.handleStakeholder(args, options);
          break;
          
        // Business analysis commands
        case 'business-analysis':
          await this.handleBusinessAnalysis(args, options);
          break;
          
        // Risk and compliance commands
        case 'risk-compliance':
          await this.handleRiskCompliance(args, options);
          break;
          
        // Feedback commands
        case 'feedback':
          await this.handleFeedback(args, options);
          break;
          
        // Integration commands
        case 'confluence':
          await this.handleConfluence(args, options);
          break;
        case 'sharepoint':
          await this.handleSharePoint(args, options);
          break;
        case 'vcs':
          await this.handleVcs(args, options);
          break;
          
        // User Stories commands
        case 'strategic-planning':
          await this.handleStrategicPlanning(args, options);
          break;
        case 'requirements-generation':
          await this.handleRequirementsGeneration(args, options);
          break;
        case 'technology-analysis':
          await this.handleTechnologyAnalysis(args, options);
          break;
        case 'risk-management':
          await this.handleRiskManagement(args, options);
          break;
        case 'comprehensive-analysis':
          await this.handleComprehensiveAnalysis(args, options);
          break;
          
        default:
          throw new Error(`Unknown command: ${command}`);
      }
      
      return { success: true, message: `Command '${command}' executed successfully` };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`❌ Error executing command '${command}':`, errorMessage);
      return { 
        success: false, 
        error: error instanceof Error ? error : new Error(errorMessage),
        message: `Failed to execute '${command}': ${errorMessage}`
      };
    }
  }
  
  /**
   * Parse command line arguments into options object
   */
  private parseArguments(args: string[]): CommandOptions {
    const options: CommandOptions = {};
    
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      
      if (arg.startsWith('--')) {
        const key = arg.substring(2);
        const nextArg = args[i + 1];
        
        if (nextArg && !nextArg.startsWith('--')) {
          // Option with value
          options[key] = nextArg;
          i++; // Skip next argument as it's the value
        } else {
          // Boolean flag
          options[key] = true;
        }
      } else if (arg.startsWith('-')) {
        const key = arg.substring(1);
        const nextArg = args[i + 1];
        
        if (nextArg && !nextArg.startsWith('-')) {
          // Option with value
          options[key] = nextArg;
          i++; // Skip next argument as it's the value
        } else {
          // Boolean flag
          options[key] = true;
        }
      }
    }
    
    return options;
  }
  
  /**
   * Handle generate command
   */
  private async handleGenerate(args: string[], options: CommandOptions): Promise<void> {
    const key = args.find(arg => !arg.startsWith('-')) || '';
    if (!key) {
      throw new Error('Document key is required for generate command');
    }
    
    await handleGenerateCommand(key, {
      output: options.output || options.o || DEFAULT_OUTPUT_DIR,
      format: options.format || 'markdown',
      quiet: options.quiet || options.q || false,
      retries: parseInt(options.retries || '0'),
      retryBackoff: parseInt(options['retry-backoff'] || '1000'),
      retryMaxDelay: parseInt(options['retry-max-delay'] || '30000')
    });
  }
  
  /**
   * Handle generate-category command
   */
  private async handleGenerateCategory(args: string[], options: CommandOptions): Promise<void> {
    const category = args.find(arg => !arg.startsWith('-')) || '';
    if (!category) {
      throw new Error('Category is required for generate-category command');
    }
    
    await handleGenerateCategoryCommand(category, {
      output: options.output || options.o || DEFAULT_OUTPUT_DIR,
      quiet: options.quiet || options.q || false,
      retries: parseInt(options.retries || '0'),
      retryBackoff: parseInt(options['retry-backoff'] || '1000'),
      retryMaxDelay: parseInt(options['retry-max-delay'] || '30000')
    });
  }
  
  /**
   * Handle generate-all command
   */
  private async handleGenerateAll(options: CommandOptions): Promise<void> {
    await handleGenerateAllCommand({
      output: options.output || options.o || DEFAULT_OUTPUT_DIR,
      quiet: options.quiet || options.q || false,
      retries: parseInt(options.retries || '0'),
      retryBackoff: parseInt(options['retry-backoff'] || '1000'),
      retryMaxDelay: parseInt(options['retry-max-delay'] || '30000')
    });
  }
  
  /**
   * Handle generate-core-analysis command
   */
  private async handleGenerateCoreAnalysis(options: CommandOptions): Promise<void> {
    await handleGenerateCoreAnalysisCommand({
      output: options.output || options.o || DEFAULT_OUTPUT_DIR,
      quiet: options.quiet || options.q || false,
      retries: parseInt(options.retries || '0'),
      retryBackoff: parseInt(options['retry-backoff'] || '1000'),
      retryMaxDelay: parseInt(options['retry-max-delay'] || '30000')
    });
  }
  
  /**
   * Handle list-templates command
   */
  private async handleListTemplates(): Promise<void> {
    await handleListTemplatesCommand();
  }
  
  /**
   * Handle analyze command
   */
  private async handleAnalyze(args: string[], options: CommandOptions): Promise<void> {
    await handleAnalyzeCommand();
  }
  
  /**
   * Handle status command
   */
  private async handleStatus(options: CommandOptions): Promise<void> {
    await handleStatusCommand();
  }
  
  /**
   * Handle validate command
   */
  private async handleValidate(options: CommandOptions): Promise<void> {
    await handleValidateCommand({
      outputDir: options.output || options['output-dir'] || DEFAULT_OUTPUT_DIR,
      quiet: options.quiet || options.q || false
    });
  }
  
  /**
   * Handle setup command
   */
  private async handleSetup(options: CommandOptions): Promise<void> {
    await handleSetupCommand();
  }
  
  /**
   * Handle stakeholder commands
   */
  private async handleStakeholder(args: string[], options: CommandOptions): Promise<void> {
    const subcommand = args.find(arg => !arg.startsWith('-')) || 'analysis';
    
    const stakeholderOptions = {
      outputDir: options['output-dir'] || options.output || options.o || DEFAULT_OUTPUT_DIR,
      format: options.format || 'markdown',
      verbose: options.verbose || options.v || false,
      includeRegister: options['include-register'] !== false,
      includeEngagementPlan: options['include-engagement-plan'] || false,
      analysisDepth: options['analysis-depth'] || 'comprehensive'
    };
    
    switch (subcommand) {
      case 'analysis':
        await handleStakeholderAnalysisCommand(stakeholderOptions);
        break;
      case 'register':
        await handleStakeholderRegisterCommand(stakeholderOptions);
        break;
      case 'engagement-plan':
        await handleStakeholderEngagementPlanCommand(stakeholderOptions);
        break;
      case 'automate':
        await handleStakeholderAutomationCommand(stakeholderOptions);
        break;
      default:
        throw new Error(`Unknown stakeholder subcommand: ${subcommand}`);
    }
  }
  
  /**
   * Handle business-analysis commands
   */
  private async handleBusinessAnalysis(args: string[], options: CommandOptions): Promise<void> {
    const subcommand = args.find(arg => !arg.startsWith('-')) || 'help';
    
    const businessAnalysisOptions = {
      outputDir: options['output-dir'] || options.output || options.o || DEFAULT_OUTPUT_DIR,
      format: options.format || 'markdown',
      verbose: options.verbose || options.v || false,
      stakeholderRole: options['stakeholder-role'],
      workshopType: options['workshop-type'],
      duration: parseInt(options.duration || '4'),
      participants: options.participants ? options.participants.split(',') : undefined,
      elicitationType: options['elicitation-type'],
      targetAudience: options['target-audience'],
      objectives: options.objectives ? options.objectives.split(',') : undefined,
      analysisType: options['analysis-type'],
      modelType: options['model-type'],
      currentState: options['current-state'],
      futureState: options['future-state'],
      qualityType: options['quality-type'],
      standards: options.standards,
      template: options.template,
      documents: options.documents ? options.documents.split(',') : undefined
    };
    
    // Get additional arguments (file paths, etc.)
    const additionalArgs = args.filter(arg => !arg.startsWith('-')).slice(1);
    
    switch (subcommand) {
      case 'interview-questions':
        const stakeholderRole = additionalArgs[0];
        if (!stakeholderRole) {
          throw new Error('Stakeholder role is required for interview-questions command');
        }
        await handleInterviewQuestionsCommand(stakeholderRole, businessAnalysisOptions);
        break;
        
      case 'workshop-plan':
        const workshopType = additionalArgs[0];
        if (!workshopType) {
          throw new Error('Workshop type is required for workshop-plan command');
        }
        await handleWorkshopPlanCommand(workshopType, businessAnalysisOptions);
        break;
        
      case 'extract-requirements':
        const notesFile = additionalArgs[0];
        if (!notesFile) {
          throw new Error('Notes file is required for extract-requirements command');
        }
        await handleRequirementsExtractionCommand(notesFile, businessAnalysisOptions);
        break;
        
      case 'process-model':
        const requirementsFile = additionalArgs[0];
        if (!requirementsFile) {
          throw new Error('Requirements file is required for process-model command');
        }
        await handleProcessModelCommand(requirementsFile, businessAnalysisOptions);
        break;
        
      case 'use-case-model':
        const useCaseFile = additionalArgs[0];
        if (!useCaseFile) {
          throw new Error('Requirements file is required for use-case-model command');
        }
        await handleUseCaseModelCommand(useCaseFile, businessAnalysisOptions);
        break;
        
      case 'business-rules':
        const businessRulesFile = additionalArgs[0];
        if (!businessRulesFile) {
          throw new Error('Requirements file is required for business-rules command');
        }
        await handleBusinessRulesCommand(businessRulesFile, businessAnalysisOptions);
        break;
        
      case 'impact-analysis':
        const requirement = additionalArgs[0];
        if (!requirement) {
          throw new Error('Requirement is required for impact-analysis command');
        }
        await handleImpactAnalysisCommand(requirement, businessAnalysisOptions);
        break;
        
      case 'quality-assessment':
        const qualityFile = additionalArgs[0];
        if (!qualityFile) {
          throw new Error('Requirements file is required for quality-assessment command');
        }
        await handleQualityAssessmentCommand(qualityFile, businessAnalysisOptions);
        break;
        
      case 'consistency-check':
        const documentFiles = additionalArgs;
        if (documentFiles.length === 0) {
          throw new Error('At least one document file is required for consistency-check command');
        }
        await handleConsistencyValidationCommand(documentFiles, businessAnalysisOptions);
        break;
        
      case 'quality-metrics':
        await handleQualityMetricsCommand(businessAnalysisOptions);
        break;
        
      case 'help':
      default:
        displayBusinessAnalysisHelp();
        break;
    }
  }

  /**
   * Handle risk-compliance command
   */
  private async handleRiskCompliance(args: string[], options: CommandOptions): Promise<void> {
    const project = options.project || options.p;
    if (!project) {
      throw new Error('Project name is required for risk-compliance command');
    }
    
    // Create and execute the risk compliance command
    const { createRiskComplianceCommand } = await import('../../commands/risk-compliance.js');
    const command = createRiskComplianceCommand();
    
    // Build command arguments
    const commandArgs = [
      '--project', project,
      '--type', options.type || options.t || 'SOFTWARE_DEVELOPMENT',
      '--output', options.output || options.o || 'generated-documents/risk-compliance',
      '--format', options.format || 'markdown'
    ];
    
    if (options.description || options.d) {
      commandArgs.push('--description', options.description || options.d);
    }
    
    if (options.integrated) {
      commandArgs.push('--integrated');
    }
    
    if (options['pmbok-only']) {
      commandArgs.push('--pmbok-only');
    }
    
    // Execute the command by calling its action directly
    const parsedOptions = command.parse(commandArgs, { from: 'user' });
  }
  
  /**
   * Handle feedback command
   */
  private async handleFeedback(args: string[], options: CommandOptions): Promise<void> {
    const subcommand = args.find(arg => !arg.startsWith('-')) || 'stats';
    
    // Create and execute the feedback command
    const { createFeedbackCommand } = await import('../../commands/feedback.js');
    const command = createFeedbackCommand();
    
    // Build command arguments for the subcommand
    const commandArgs = [subcommand];
    
    // Add options based on subcommand
    if (options.project || options.p) {
      commandArgs.push('--project', options.project || options.p);
    }
    
    if (options.days) {
      commandArgs.push('--days', options.days);
    }
    
    if (options['document-type']) {
      commandArgs.push('--document-type', options['document-type']);
    }
    
    if (options['dry-run']) {
      commandArgs.push('--dry-run');
    }
    
    // Execute the command by parsing the arguments
    await command.parseAsync(commandArgs, { from: 'user' });
  }
  
  /**
   * Handle confluence commands
   */
  private async handleConfluence(args: string[], options: CommandOptions): Promise<void> {
    const subcommand = args.find(arg => !arg.startsWith('-')) || 'status';
    const confluenceOptions = { quiet: options.quiet || options.q || false };
    
    switch (subcommand) {
      case 'init':
        await handleConfluenceInitCommand(confluenceOptions);
        break;
      case 'test':
        await handleConfluenceTestCommand(confluenceOptions);
        break;
      case 'publish':
        await handleConfluencePublishCommand({
          ...confluenceOptions,
          documentsPath: options['documents-path'],
          parentPageTitle: options['parent-page'],
          labelPrefix: options['label-prefix'],
          dryRun: options['dry-run'] || false,
          force: options.force || false
        });
        break;
      case 'status':
        await handleConfluenceStatusCommand(confluenceOptions);
        break;
      default:
        throw new Error(`Unknown confluence subcommand: ${subcommand}`);
    }
  }
  
  /**
   * Handle sharepoint commands
   */
  private async handleSharePoint(args: string[], options: CommandOptions): Promise<void> {
    const subcommand = args.find(arg => !arg.startsWith('-')) || 'status';
    const sharepointOptions = { quiet: options.quiet || options.q || false };
    
    switch (subcommand) {
      case 'init':
        await handleSharePointInitCommand(sharepointOptions);
        break;
      case 'test':
        await handleSharePointTestCommand(sharepointOptions);
        break;
      case 'publish':
        await handleSharePointPublishCommand({
          ...sharepointOptions,
          documentsPath: options['documents-path'],
          folderPath: options['folder-path'],
          labelPrefix: options['label-prefix'],
          dryRun: options['dry-run'] || false,
          force: options.force || false
        });
        break;
      case 'status':
        await handleSharePointStatusCommand(sharepointOptions);
        break;
      default:
        throw new Error(`Unknown sharepoint subcommand: ${subcommand}`);
    }
  }
  
  /**
   * Handle vcs commands
   */
  private async handleVcs(args: string[], options: CommandOptions): Promise<void> {
    const subcommand = args.find(arg => !arg.startsWith('-')) || 'status';
    const vcsOptions = { 
      outputDir: options.output || DEFAULT_OUTPUT_DIR,
      quiet: options.quiet || options.q || false 
    };
    
    switch (subcommand) {
      case 'init':
        await handleVcsInitCommand(vcsOptions);
        break;
      case 'status':
        await handleVcsStatusCommand(vcsOptions);
        break;
      case 'commit':
        await handleVcsCommitCommand({
          ...vcsOptions,
          message: options.message || 'Update generated documents'
        });
        break;
      case 'push':
        await handleVcsPushCommand({
          ...vcsOptions,
          remote: options.remote || 'origin',
          branch: options.branch || 'main'
        });
        break;
      default:
        throw new Error(`Unknown vcs subcommand: ${subcommand}`);
    }
  }

  /**
   * Handle user stories commands
   */
  private async handleStrategicPlanning(args: string[], options: CommandOptions): Promise<void> {
    const userStoryOptions = {
      businessProblem: options.businessProblem || options.problem,
      technologyStack: options.technologyStack ? options.technologyStack.split(',') : [],
      contextBundle: options.contextBundle || options.context || '',
      output: options.output || DEFAULT_OUTPUT_DIR,
      format: options.format || 'markdown',
      quiet: options.quiet || false
    };

    await handleStrategicPlanningCommand(userStoryOptions);
  }

  private async handleRequirementsGeneration(args: string[], options: CommandOptions): Promise<void> {
    const userStoryOptions = {
      businessProblem: options.businessProblem || options.problem,
      technologyStack: options.technologyStack ? options.technologyStack.split(',') : [],
      contextBundle: options.contextBundle || options.context || '',
      output: options.output || DEFAULT_OUTPUT_DIR,
      format: options.format || 'json',
      quiet: options.quiet || false
    };

    await handleRequirementsGenerationCommand(userStoryOptions);
  }

  private async handleTechnologyAnalysis(args: string[], options: CommandOptions): Promise<void> {
    const userStoryOptions = {
      businessProblem: options.businessProblem || options.problem,
      technologyStack: options.technologyStack ? options.technologyStack.split(',') : [],
      contextBundle: options.contextBundle || options.context || '',
      output: options.output || DEFAULT_OUTPUT_DIR,
      format: options.format || 'markdown',
      quiet: options.quiet || false
    };

    await handleTechnologyAnalysisCommand(userStoryOptions);
  }

  private async handleRiskManagement(args: string[], options: CommandOptions): Promise<void> {
    const userStoryOptions = {
      businessProblem: options.businessProblem || options.problem,
      technologyStack: options.technologyStack ? options.technologyStack.split(',') : [],
      contextBundle: options.contextBundle || options.context || '',
      output: options.output || DEFAULT_OUTPUT_DIR,
      format: options.format || 'markdown',
      quiet: options.quiet || false
    };

    await handleRiskManagementCommand(userStoryOptions);
  }

  private async handleComprehensiveAnalysis(args: string[], options: CommandOptions): Promise<void> {
    const userStoryOptions = {
      businessProblem: options.businessProblem || options.problem,
      technologyStack: options.technologyStack ? options.technologyStack.split(',') : [],
      contextBundle: options.contextBundle || options.context || '',
      output: options.output || DEFAULT_OUTPUT_DIR,
      format: options.format || 'markdown',
      quiet: options.quiet || false
    };

    await handleComprehensiveAnalysisCommand(userStoryOptions);
  }
}

export default CommandIntegrationService;