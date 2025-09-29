/**
 * Document Generation Progress Service
 * 
 * This service manages the progress tracking for document generation
 * with detailed step-by-step updates.
 */

export interface GenerationStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'error' | 'skipped';
  progress: number; // 0-100
  startTime?: Date;
  endTime?: Date;
  duration?: number; // in milliseconds
  details?: string;
  error?: string;
}

export interface ProgressUpdate {
  stepId: string;
  status: GenerationStep['status'];
  progress?: number;
  details?: string;
  error?: string;
}

export class DocumentGenerationProgressService {
  private steps: GenerationStep[] = [];
  private currentStepIndex: number = 0;
  private onProgressUpdate?: (steps: GenerationStep[], currentStep: number, overallProgress: number) => void;
  private startTime: Date = new Date();

  constructor(onProgressUpdate?: (steps: GenerationStep[], currentStep: number, overallProgress: number) => void) {
    this.onProgressUpdate = onProgressUpdate;
    this.initializeSteps();
  }

  private initializeSteps(): void {
    this.steps = [
      {
        id: 'validate-input',
        name: 'Validate Input Data',
        description: 'Validating project context and template requirements',
        status: 'pending',
        progress: 0
      },
      {
        id: 'connect-database',
        name: 'Connect to Database',
        description: 'Establishing connection to MongoDB and verifying template availability',
        status: 'pending',
        progress: 0
      },
      {
        id: 'load-template',
        name: 'Load Template',
        description: 'Retrieving template data and AI instructions from database',
        status: 'pending',
        progress: 0
      },
      {
        id: 'prepare-context',
        name: 'Prepare Context',
        description: 'Building project context and preparing data for AI processing',
        status: 'pending',
        progress: 0
      },
      {
        id: 'initialize-ai',
        name: 'Initialize AI Processor',
        description: 'Setting up AI processor with template instructions and context',
        status: 'pending',
        progress: 0
      },
      {
        id: 'generate-content',
        name: 'Generate Content',
        description: 'AI is generating the document content based on template and context',
        status: 'pending',
        progress: 0
      },
      {
        id: 'validate-content',
        name: 'Validate Content',
        description: 'Validating generated content for completeness and quality',
        status: 'pending',
        progress: 0
      },
      {
        id: 'format-document',
        name: 'Format Document',
        description: 'Applying markdown formatting and structure to the generated content',
        status: 'pending',
        progress: 0
      },
      {
        id: 'save-database',
        name: 'Save to Database',
        description: 'Storing the generated document in the database',
        status: 'pending',
        progress: 0
      },
      {
        id: 'finalize',
        name: 'Finalize Document',
        description: 'Completing document generation and preparing for delivery',
        status: 'pending',
        progress: 0
      }
    ];
  }

  public startGeneration(): void {
    this.startTime = new Date();
    this.currentStepIndex = 0;
    this.notifyProgress();
  }

  public updateStep(update: ProgressUpdate): void {
    const stepIndex = this.steps.findIndex(step => step.id === update.stepId);
    if (stepIndex === -1) return;

    const step = this.steps[stepIndex];
    
    // Update step status
    if (update.status === 'in-progress' && step.status === 'pending') {
      step.startTime = new Date();
    }
    
    if (update.status === 'completed' || update.status === 'error') {
      step.endTime = new Date();
      if (step.startTime) {
        step.duration = step.endTime.getTime() - step.startTime.getTime();
      }
    }

    step.status = update.status;
    if (update.progress !== undefined) {
      step.progress = update.progress;
    }
    if (update.details) {
      step.details = update.details;
    }
    if (update.error) {
      step.error = update.error;
    }

    // Update current step index
    if (update.status === 'completed' && stepIndex === this.currentStepIndex) {
      this.currentStepIndex = Math.min(this.currentStepIndex + 1, this.steps.length - 1);
    }

    this.notifyProgress();
  }

  public completeStep(stepId: string, details?: string): void {
    this.updateStep({
      stepId,
      status: 'completed',
      progress: 100,
      details
    });
  }

  public errorStep(stepId: string, error: string): void {
    this.updateStep({
      stepId,
      status: 'error',
      error
    });
  }

  public skipStep(stepId: string, reason?: string): void {
    this.updateStep({
      stepId,
      status: 'skipped',
      details: reason
    });
  }

  public getCurrentStep(): GenerationStep | null {
    return this.steps[this.currentStepIndex] || null;
  }

  public getSteps(): GenerationStep[] {
    return [...this.steps];
  }

  public getOverallProgress(): number {
    const completedSteps = this.steps.filter(step => step.status === 'completed').length;
    const inProgressStep = this.steps.find(step => step.status === 'in-progress');
    
    let progress = (completedSteps / this.steps.length) * 100;
    
    if (inProgressStep) {
      progress += (inProgressStep.progress / this.steps.length);
    }
    
    return Math.min(100, progress);
  }

  public getEstimatedTimeRemaining(): number {
    const elapsed = Date.now() - this.startTime.getTime();
    const progress = this.getOverallProgress();
    
    if (progress === 0) return 0;
    
    const estimatedTotal = (elapsed / progress) * 100;
    return Math.max(0, (estimatedTotal - elapsed) / 1000); // in seconds
  }

  public isComplete(): boolean {
    return this.steps.every(step => step.status === 'completed' || step.status === 'skipped');
  }

  public hasErrors(): boolean {
    return this.steps.some(step => step.status === 'error');
  }

  private notifyProgress(): void {
    if (this.onProgressUpdate) {
      this.onProgressUpdate(this.getSteps(), this.currentStepIndex, this.getOverallProgress());
    }
  }

  // Utility methods for common operations
  public simulateStepProgress(stepId: string, duration: number = 2000): Promise<void> {
    return new Promise((resolve) => {
      this.updateStep({ stepId, status: 'in-progress', progress: 0 });
      
      const interval = setInterval(() => {
        const step = this.steps.find(s => s.id === stepId);
        if (!step || step.status !== 'in-progress') {
          clearInterval(interval);
          resolve();
          return;
        }
        
        const elapsed = Date.now() - (step.startTime?.getTime() || 0);
        const progress = Math.min(100, (elapsed / duration) * 100);
        
        this.updateStep({ stepId, progress });
        
        if (progress >= 100) {
          clearInterval(interval);
          this.completeStep(stepId);
          resolve();
        }
      }, 100);
    });
  }
}
