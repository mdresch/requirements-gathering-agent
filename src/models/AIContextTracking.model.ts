import mongoose, { Document, Schema } from 'mongoose';

export interface IAIContextTracking extends Document {
  // Basic Information
  id: string;
  projectId: string;
  documentId?: string;
  templateId: string;
  generationJobId: string;
  
  // AI Provider Information
  aiProvider: string;
  aiModel: string;
  providerConfig: {
    modelName: string;
    maxTokens: number;
    temperature: number;
    topP?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
  };
  
  // Context Utilization
  contextUtilization: {
    totalTokensUsed: number;
    maxContextWindow: number;
    utilizationPercentage: number;
    breakdown: {
      systemPromptTokens: number;
      userPromptTokens: number;
      projectContextTokens: number;
      templateTokens: number;
      outputTokens: number;
      responseTokens: number;
    };
  };
  
  // Input Context
  inputContext: {
    systemPrompt: string;
    userPrompt: string;
    projectContext: any;
    templateContent: string;
    fullContext: string;
  };
  
  // AI Response
  aiResponse: {
    rawResponse: string;
    processedResponse: string;
    responseMetadata: {
      finishReason: string;
      usage: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
      };
      model: string;
      timestamp: string;
    };
  };
  
  // Performance Metrics
  performance: {
    generationTimeMs: number;
    tokensPerSecond: number;
    costEstimate?: {
      currency: string;
      amount: number;
      costPerToken: number;
    };
  };
  
  // Traceability
  traceability: {
    sourceInformation: {
      projectName: string;
      projectType: string;
      framework: string;
      documentType: string;
      templateVersion: string;
    };
    generationChain: {
      parentJobId?: string;
      childJobIds: string[];
      dependencies: string[];
    };
    qualityMetrics: {
      complianceScore: number;
      qualityScore: number;
      automatedChecks: any[];
    };
  };
  
  // Audit Trail
  metadata: {
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
    sessionId?: string;
    requestId?: string;
    userAgent?: string;
    ipAddress?: string;
  };
  
  // Status and Lifecycle
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  errorDetails?: {
    errorCode: string;
    errorMessage: string;
    stackTrace?: string;
    retryCount: number;
  };
}

const AIContextTrackingSchema: Schema = new Schema({
  // Basic Information
  projectId: { 
    type: String, 
    required: true,
    index: true 
  },
  documentId: { 
    type: String, 
    index: true 
  },
  templateId: { 
    type: String, 
    required: true,
    index: true 
  },
  generationJobId: { 
    type: String, 
    required: true,
    unique: true,
    index: true 
  },
  
  // AI Provider Information
  aiProvider: { 
    type: String, 
    required: true,
    index: true 
  },
  aiModel: { 
    type: String, 
    required: true 
  },
  providerConfig: {
    modelName: { type: String, required: true },
    maxTokens: { type: Number, required: true },
    temperature: { type: Number, required: true, default: 0.7 },
    topP: { type: Number },
    frequencyPenalty: { type: Number },
    presencePenalty: { type: Number }
  },
  
  // Context Utilization
  contextUtilization: {
    totalTokensUsed: { type: Number, required: true },
    maxContextWindow: { type: Number, required: true },
    utilizationPercentage: { type: Number, required: true },
    breakdown: {
      systemPromptTokens: { type: Number, required: true, default: 0 },
      userPromptTokens: { type: Number, required: true, default: 0 },
      projectContextTokens: { type: Number, required: true, default: 0 },
      templateTokens: { type: Number, required: true, default: 0 },
      outputTokens: { type: Number, required: true, default: 0 },
      responseTokens: { type: Number, required: true, default: 0 }
    }
  },
  
  // Input Context
  inputContext: {
    systemPrompt: { type: String, required: true },
    userPrompt: { type: String, required: true },
    projectContext: { type: Schema.Types.Mixed, required: true },
    templateContent: { type: String, required: true },
    fullContext: { type: String, required: true }
  },
  
  // AI Response
  aiResponse: {
    rawResponse: { type: String, required: true },
    processedResponse: { type: String },
    responseMetadata: {
      finishReason: { type: String, required: true },
      usage: {
        promptTokens: { type: Number, required: true },
        completionTokens: { type: Number, required: true },
        totalTokens: { type: Number, required: true }
      },
      model: { type: String, required: true },
      timestamp: { type: String, required: true }
    }
  },
  
  // Performance Metrics
  performance: {
    generationTimeMs: { type: Number, required: true },
    tokensPerSecond: { type: Number, required: true },
    costEstimate: {
      currency: { type: String, default: 'USD' },
      amount: { type: Number },
      costPerToken: { type: Number }
    }
  },
  
  // Traceability
  traceability: {
    sourceInformation: {
      projectName: { type: String, required: true },
      projectType: { type: String, required: true },
      framework: { type: String, required: true },
      documentType: { type: String, required: true },
      templateVersion: { type: String, required: true }
    },
    generationChain: {
      parentJobId: { type: String },
      childJobIds: { type: [String], default: [] },
      dependencies: { type: [String], default: [] }
    },
    qualityMetrics: {
      complianceScore: { type: Number, default: 0 },
      qualityScore: { type: Number, default: 0 },
      automatedChecks: { type: [Schema.Types.Mixed], default: [] }
    }
  },
  
  // Audit Trail
  metadata: {
    createdBy: { type: String, required: true, default: 'system' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    sessionId: { type: String },
    requestId: { type: String },
    userAgent: { type: String },
    ipAddress: { type: String }
  },
  
  // Status and Lifecycle
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
    default: 'pending',
    index: true
  },
  errorDetails: {
    errorCode: { type: String },
    errorMessage: { type: String },
    stackTrace: { type: String },
    retryCount: { type: Number, default: 0 }
  }
}, {
  timestamps: true,
  collection: 'ai_context_tracking'
});

// Indexes for performance
AIContextTrackingSchema.index({ projectId: 1, createdAt: -1 });
AIContextTrackingSchema.index({ templateId: 1, createdAt: -1 });
AIContextTrackingSchema.index({ aiProvider: 1, createdAt: -1 });
AIContextTrackingSchema.index({ status: 1, createdAt: -1 });
AIContextTrackingSchema.index({ 'traceability.sourceInformation.framework': 1 });
AIContextTrackingSchema.index({ 'contextUtilization.utilizationPercentage': -1 });

// Pre-save middleware to update timestamps
AIContextTrackingSchema.pre('save', function (this: any, next) {
  this.metadata.updatedAt = new Date();
  next();
});

// Virtual for utilization efficiency
AIContextTrackingSchema.virtual('utilizationEfficiency').get(function() {
  const utilization = (this as any).contextUtilization?.utilizationPercentage || 0;
  if (utilization >= 90) return 'high';
  if (utilization >= 70) return 'medium';
  return 'low';
});

// Method to get context breakdown summary
AIContextTrackingSchema.methods.getContextBreakdown = function() {
  const breakdown = this.contextUtilization.breakdown;
  const total = this.contextUtilization.totalTokensUsed;
  
  return {
    systemPrompt: { tokens: breakdown.systemPromptTokens, percentage: (breakdown.systemPromptTokens / total * 100).toFixed(2) },
    userPrompt: { tokens: breakdown.userPromptTokens, percentage: (breakdown.userPromptTokens / total * 100).toFixed(2) },
    projectContext: { tokens: breakdown.projectContextTokens, percentage: (breakdown.projectContextTokens / total * 100).toFixed(2) },
    template: { tokens: breakdown.templateTokens, percentage: (breakdown.templateTokens / total * 100).toFixed(2) },
    output: { tokens: breakdown.outputTokens, percentage: (breakdown.outputTokens / total * 100).toFixed(2) },
    response: { tokens: breakdown.responseTokens, percentage: (breakdown.responseTokens / total * 100).toFixed(2) }
  };
};

export const AIContextTracking = mongoose.model<IAIContextTracking>('AIContextTracking', AIContextTrackingSchema);
