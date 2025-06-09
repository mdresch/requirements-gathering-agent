/**
 * Enhanced AI Provider Types and Interfaces for Interactive Provider Selection
 * 
 * Extends the base AI types with enhanced configuration interfaces for the
 * interactive provider selection menu feature.
 * 
 * @version 2.1.3
 * @author Requirements Gathering Agent Team
 * @created June 2025
 * 
 * @filepath c:\Users\menno\Source\Repos\requirements-gathering-agent\src\modules\ai\enhanced-types.ts
 */

import { AIProvider, ProviderMetrics } from './types.js';

export interface EnhancedProviderConfig {
  id: string;
  name: string;
  displayName: string;
  description: string;
  category: 'cloud' | 'local' | 'free' | 'enterprise';
  priority: number;
  
  // Status and availability
  check: () => Promise<boolean>;
  isAvailable: () => Promise<boolean>;
  getStatus: () => Promise<ProviderStatus>;
  
  // Configuration
  requiredEnvVars: string[];
  optionalEnvVars: string[];
  configTemplate: Record<string, string>;
  setupGuide: SetupGuide;
  
  // Capabilities
  tokenLimit: number;
  features: string[];
  costInfo?: CostInfo;
  
  // UI
  icon: string;
  statusColor: string;
  recommendation?: string;
}

export interface ProviderStatus {
  configured: boolean;
  available: boolean;
  connected: boolean;
  lastChecked: Date;
  error?: string;
  metrics?: ProviderMetrics;
}

export interface SetupGuide {
  steps: SetupStep[];
  estimatedTime: string;
  difficulty: 'easy' | 'medium' | 'advanced';
  prerequisites: string[];
  helpLinks: { title: string; url: string }[];
}

export interface SetupStep {
  title: string;
  description: string;
  action: 'manual' | 'command' | 'input';
  command?: string;
  validation?: () => Promise<boolean>;
}

export interface CostInfo {
  tier: 'free' | 'paid' | 'enterprise';
  costPerToken?: number;
  dailyLimit?: number;
  description: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings?: string[];
}

export interface ConnectionTestResult {
  success: boolean;
  responseTime?: number;
  error?: string;
  errorCode?: string;
  suggestions?: string[];
  metadata?: Record<string, any>;
}

export interface MenuAction {
  action: 'select' | 'configure' | 'retry-setup' | 'change-provider' | 'show-help' | 'exit';
  providerId?: string;
  data?: any;
}

export interface InteractiveMenuOptions {
  showMetrics?: boolean;
  allowExit?: boolean;  autoRefresh?: boolean;
  refreshInterval?: number;
}

// Re-export base types for convenience
export type { AIProvider, ProviderMetrics } from './types.js';
