/**
 * Core Type Definitions for Requirements Gathering Agent
 * 
 * Global TypeScript type definitions and interfaces for external API
 * consumption and main functionality exports.
 * 
 * @version 2.1.3
 * @author Requirements Gathering Agent Team
 * @created 2024
 * @updated June 2025
 * 
 * Key Features:
 * - External API type definitions
 * - Strategic sections input/output interfaces  
 * - Requirements generation type specifications
 * - Public interface consistency
 * - Consumer-friendly type exports
 * - TypeScript module resolution support
 * 
 * @filepath c:\Users\menno\Source\Repos\requirements-gathering-agent\types.ts
 */

// Input types for strategic sections generation
export type StrategicSectionsInput = {
  businessProblem: string;
  technologyStack: string[];
  contextBundle: string;
};

// Output types for strategic sections (matching actual implementation)
export type StrategicSectionsOutput = {
  vision: string;
  mission: string;
  coreValues: string;
  purpose: string;
};

// Input types for requirements generation
export type RequirementsInput = {
  businessProblem: string;
  technologyStack: string[];
  contextBundle: string;
};

// Individual requirement structure
export type Requirement = {
  role: string;
  needs: string[];
  processes: string[];
};

// Requirements generation output
export type RequirementsOutput = Requirement[];

// Re-export core interfaces from the main module
export type {
  ProjectContext,
  StrategicSections,
  UserRequirement
} from "./src/index.js";
