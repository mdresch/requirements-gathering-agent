// ProcessorFactory.ts
//
// Modular, configuration-driven processor factory for document generation.
//
// This factory loads and registers document processors based on the configuration in processor-config.json.
// Processors are referenced by canonical keys and loaded either statically (for core/built-in processors) or dynamically (for extension processors).
//
// To add a new processor:
//   1. Implement your processor class in src/modules/documentTemplates/<category>/<YourProcessor>.ts
//   2. Register it in processor-config.json using the format: "your-key": "../documentTemplates/<category>/<YourProcessor>.ts#YourProcessorClassName"
//   3. (If statically imported) Add an import and registration entry below.
//   4. Ensure your processor implements the DocumentProcessor interface: process(context: ProjectContext): DocumentOutput
//
// The factory provides robust error handling and logger support. If a processor cannot be loaded, a descriptive error is thrown.
//
// For more details, see docs/ARCHITECTURE.md and docs/STEPS-TO-IMPLEMENT-NEW-DOCS.md.

// Temporary local definition if ILogger is missing
export interface ILogger {
  error: (...args: any[]) => void;
  info?: (...args: any[]) => void;
  warn?: (...args: any[]) => void;
  debug?: (...args: any[]) => void;
}

import { MissionVisionCoreValuesProcessor, ProjectPurposeProcessor } from '../documentTemplates/strategic-statements/strategicStatementsProcessor';
import { ProjectKickoffPreparationsChecklistProcessor } from '../documentTemplates/planningArtifacts/projectKickoffPreparationsChecklistProcessor';
// ... import other modular processors as needed ...
import processorConfigDefault from './processor-config.json';
import Ajv from 'ajv';
import configSchema from '../../../docs/config-rga.schema.json';

// Example interface for processors
export interface DocumentProcessor {
  process(context: any): any; // Replace 'any' with actual types
}

interface ProcessorMap {
  [taskKey: string]: new (...args: any[]) => DocumentProcessor;
}

export class ProcessorFactory {
  public processorMap: ProcessorMap = {
    'mission-vision-core-values': MissionVisionCoreValuesProcessor,
    'project-purpose': ProjectPurposeProcessor,
    'project-kickoff-preparations-checklist': ProjectKickoffPreparationsChecklistProcessor,
    // ...register other processors here...
  };

  constructor(
    private logger: ILogger,
    private processorConfig: Record<string, string> = processorConfigDefault,
    private dynamicImport: (path: string) => Promise<any> = (path) => import(path)
  ) {}

  private validateConfig(): void {
    const ajv = new Ajv();
    const validate = ajv.compile(configSchema as object);
    if (!validate(this.processorConfig)) {
      this.logger.error('Processor config validation errors:', validate.errors);
      throw new Error('Processor config validation failed');
    }
  }

  public async loadProcessorsFromConfig(): Promise<void> {
    this.validateConfig();
    for (const [taskKey, modulePathAndClass] of Object.entries(this.processorConfig)) {
      const [modulePath, className] = modulePathAndClass.split('#');
      try {
        const module = await this.dynamicImport(modulePath);
        const ProcessorClass = module[className];
        if (ProcessorClass) {
          this.registerProcessor(taskKey, ProcessorClass);
        } else {
          this.logger.error(`Processor class "${className}" not found in module "${modulePath}".`);
        }
      } catch (error) {
        this.logger.error(`Error loading processor module "${modulePath}": ${error}`);
      }
    }
  }

  getProcessorForTask(taskKey: string, ...args: any[]): DocumentProcessor {
    const ProcessorClass = this.processorMap[taskKey];
    if (ProcessorClass) {
      try {
        return new ProcessorClass(...args);
      } catch (error) {
        this.logger.error(`Error instantiating processor ${taskKey}: ${error}`);
        throw new ProcessorInstantiationError(`Failed to create processor for ${taskKey}`, error);
      }
    } else {
      this.logger.error(`Processor not found for taskKey: ${taskKey}.`);
      throw new ProcessorNotFoundError(`Processor not found for taskKey: ${taskKey}`);
    }
  }

  registerProcessor(taskKey: string, processorClass: new (...args: any[]) => DocumentProcessor) {
    this.processorMap[taskKey] = processorClass;
  }
}

export class ProcessorNotFoundError extends Error {}
export class ProcessorInstantiationError extends Error {
  constructor(message: string, public originalError: any) {
    super(message);
  }
}
