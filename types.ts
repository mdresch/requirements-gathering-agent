import type { generateStrategicSections, generateRequirements } from "./index";

export type StrategicSectionsInput = {
  businessProblem: string;
  technologyStack?: Array<string>;
  contextBundle?: string;
};

export type StrategicSectionsOutput = {
  vision: string;
  mission: string;
  coreValues: string[];
  purpose: string;
};

export type RequirementsInput = {
  businessProblem: string;
  technologyStack?: Array<string>;
  contextBundle?: string;
};

export type Requirement = {
  role: string;
  needs: string[];
  processes: string[];
};

export type RequirementsOutput = Requirement[];
