/**
 * Standards Compliance & Deviation Analysis Types
 * 
 * This module defines the core interfaces and types for the Project Standards
 * Compliance & Deviation Analysis framework that analyzes projects against
 * international standards (BABOK, PMBOK, DMBOK, ISO 15408) and identifies intelligent
 * deviations with reasoning.
 */

// ===== CORE INTERFACES =====

/**
 * Main interface for the Standards Compliance Engine
 */
export interface StandardsComplianceEngine {
  validateAgainstBABOK(projectData: ProjectData): Promise<BABOKComplianceResult>;
  validateAgainstPMBOK(projectData: ProjectData): Promise<PMBOKComplianceResult>;
  validateAgainstDMBOK(projectData: ProjectData): Promise<DMBOKComplianceResult>;
  validateAgainstISO15408(projectData: ProjectData): Promise<ISO15408ComplianceResult>;
  generateDeviationAnalysis(results: ComplianceResult[]): Promise<DeviationAnalysis>;
  generateExecutiveSummary(analysis: DeviationAnalysis): Promise<ExecutiveSummary>;
}

/**
 * Project data structure for analysis
 */
export interface ProjectData {
  projectId: string;
  projectName: string;
  industry: Industry;
  projectType: ProjectType;
  complexity: ProjectComplexity;
  duration: number; // months
  budget: number;
  teamSize: number;
  stakeholderCount: number;
  regulatoryRequirements: RegulatoryRequirement[];
  methodology: Methodology;
  documents: ProjectDocument[];
  processes: ProjectProcess[];
  deliverables: ProjectDeliverable[];
  governance: GovernanceStructure;
  metadata: ProjectMetadata;
}

// ===== STANDARDS COMPLIANCE RESULTS =====

/**
 * Base compliance result interface
 */
export interface BaseComplianceResult {
  standard: 'BABOK_V3' | 'PMBOK_7' | 'DMBOK_2' | 'ISO_15408';
  overallScore: number; // 0-100
  complianceStatus: ComplianceStatus;
  assessmentDate: Date;
  assessmentVersion: string;
  criticalIssues: ComplianceIssue[];
  warnings: ComplianceIssue[];
  strengths: ComplianceStrength[];
  recommendations: ComplianceRecommendation[];
}

/**
 * BABOK v3 specific compliance result
 */
export interface BABOKComplianceResult extends BaseComplianceResult {
  standard: 'BABOK_V3';
  knowledgeAreas: {
    businessAnalysisPlanning: KnowledgeAreaScore;
    elicitation: KnowledgeAreaScore;
    requirementsLifecycle: KnowledgeAreaScore;
    strategyAnalysis: KnowledgeAreaScore;
    requirementsAnalysis: KnowledgeAreaScore;
    solutionEvaluation: KnowledgeAreaScore;
  };
  competencies: CompetencyAssessment[];
  techniques: TechniqueUsageAnalysis[];
}

/**
 * PMBOK 7th Edition specific compliance result
 */
export interface PMBOKComplianceResult extends BaseComplianceResult {
  standard: 'PMBOK_7';
  performanceDomains: {
    stakeholders: PerformanceDomainScore;
    team: PerformanceDomainScore;
    developmentApproach: PerformanceDomainScore;
    planning: PerformanceDomainScore;
    projectWork: PerformanceDomainScore;
    delivery: PerformanceDomainScore;
    measurement: PerformanceDomainScore;
    uncertainty: PerformanceDomainScore;
  };
  principles: PrincipleAlignment[];
  projectLifecycle: LifecycleAssessment;
  valueDelivery: ValueDeliveryAssessment;
}

/**
 * DMBOK 2.0 specific compliance result
 */
export interface DMBOKComplianceResult extends BaseComplianceResult {
  standard: 'DMBOK_2';
  managementFunctions: {
    dataGovernance: DataFunctionScore;
    dataArchitecture: DataFunctionScore;
    dataModelingDesign: DataFunctionScore;
    dataStorageOperations: DataFunctionScore;
    dataSecurity: DataFunctionScore;
    dataIntegration: DataFunctionScore;
    documentContentManagement: DataFunctionScore;
    referenceDataManagement: DataFunctionScore;
    dataWarehousing: DataFunctionScore;
    metadata: DataFunctionScore;
    dataQuality: DataFunctionScore;
  };
  dataMaturity: DataMaturityLevel;
  dataGovernanceFramework: GovernanceFrameworkAssessment;
}

/**
 * ISO 15408 specific compliance result
 */
export interface ISO15408ComplianceResult extends BaseComplianceResult {
  standard: 'ISO_15408';
  evaluationAssuranceLevels: {
    eal1: EALAssessment;
    eal2: EALAssessment;
    eal3: EALAssessment;
    eal4: EALAssessment;
    eal5: EALAssessment;
    eal6: EALAssessment;
    eal7: EALAssessment;
  };
  securityFunctionalRequirements: SecurityFunctionalRequirement[];
  securityAssuranceRequirements: SecurityAssuranceRequirement[];
  protectionProfiles: ProtectionProfileAssessment[];
  securityTargets: SecurityTargetAssessment[];
  evaluationResults: EvaluationResult[];
  vulnerabilityAssessment: VulnerabilityAssessment;
  riskAssessment: SecurityRiskAssessment;
  complianceGaps: SecurityComplianceGap[];
}

/**
 * Comprehensive deviation analysis result
 */
export interface DeviationAnalysis {
  analysisId: string;
  projectId: string;
  analysisDate: Date;
  analysisVersion: string;
  overallDeviationScore: number; // 0-100 (higher = more deviations)
  riskLevel: RiskLevel;
  
  standardDeviations: StandardDeviation[];
  intelligentDeviations: IntelligentDeviation[];
  crossStandardDeviations: CrossStandardDeviation[];
  
  riskAssessment: DeviationRiskAssessment;
  impactAnalysis: ImpactAnalysis;
  recommendations: DeviationRecommendation[];
  
  complianceMatrix: ComplianceMatrix;
  executiveSummary: ExecutiveSummary;
}

/**
 * Standard deviation from established practices
 */
export interface StandardDeviation {
  deviationId: string;
  deviationType: DeviationType;
  severity: DeviationSeverity;
  standard: 'BABOK_V3' | 'PMBOK_7' | 'DMBOK_2' | 'ISO_15408';
  standardSection: string;
  standardRequirement: string;
  currentApproach: string;
  gap: string;
  impact: DeviationImpact;
  recommendation: 'FIX_IMMEDIATELY' | 'PLAN_CORRECTION' | 'MONITOR' | 'ACCEPT_RISK';
}

/**
 * Intelligent deviation with reasoning and benefits
 */
export interface IntelligentDeviation {
  deviationId: string;
  deviationType: DeviationType;
  category: IntelligentDeviationCategory;
  
  standardApproach: StandardApproachDescription;
  projectApproach: ProjectApproachDescription;
  
  reasoning: DeviationReasoning;
  benefits: DeviationBenefit[];
  risks: DeviationRisk[];
  mitigations: RiskMitigation[];
  
  evidenceScore: number; // 0-100
  confidenceLevel: ConfidenceLevel;
  
  businessJustification: BusinessJustification;
  technicalJustification: TechnicalJustification;
  
  recommendation: IntelligentDeviationRecommendation;
  approvalStatus: ApprovalStatus;
  approver?: string;
  approvalDate?: Date;
  approvalComments?: string;
}

/**
 * Cross-standard deviation analysis
 */
export interface CrossStandardDeviation {
  deviationId: string;
  involvedStandards: ('BABOK_V3' | 'PMBOK_7' | 'DMBOK_2' | 'ISO_15408')[];
  conflictType: ConflictType;
  description: string;
  resolution: ConflictResolution;
  impact: CrossStandardImpact;
}

// ===== ISO 15408 SPECIFIC TYPES =====

/**
 * Evaluation Assurance Level Assessment
 */
export interface EALAssessment {
  level: number; // 1-7
  achieved: boolean;
  score: number; // 0-100
  requirements: EALRequirement[];
  gaps: string[];
  evidence: string[];
  recommendations: string[];
}

export interface EALRequirement {
  id: string;
  name: string;
  description: string;
  status: 'MET' | 'PARTIALLY_MET' | 'NOT_MET' | 'NOT_APPLICABLE';
  evidence: string[];
  gaps: string[];
}

/**
 * Security Functional Requirements
 */
export interface SecurityFunctionalRequirement {
  id: string;
  family: SecurityFunctionalFamily;
  component: string;
  element: string;
  status: SecurityRequirementStatus;
  implementation: string;
  testing: TestingStatus;
  evidence: string[];
  gaps: string[];
  riskLevel: RiskLevel;
}

export type SecurityFunctionalFamily = 
  | 'FAU' // Audit
  | 'FCO' // Communication
  | 'FCS' // Cryptographic Support
  | 'FDP' // User Data Protection
  | 'FIA' // Identification and Authentication
  | 'FMT' // Security Management
  | 'FPR' // Privacy
  | 'FPT' // Protection of the TSF
  | 'FRU' // Resource Utilisation
  | 'FTA' // TOE Access
  | 'FTP'; // Trusted Path/Channels

export type SecurityRequirementStatus = 
  | 'IMPLEMENTED' 
  | 'PARTIALLY_IMPLEMENTED' 
  | 'NOT_IMPLEMENTED' 
  | 'NOT_APPLICABLE';

export type TestingStatus = 
  | 'PASSED' 
  | 'FAILED' 
  | 'PARTIAL' 
  | 'NOT_TESTED' 
  | 'NOT_APPLICABLE';

/**
 * Security Assurance Requirements
 */
export interface SecurityAssuranceRequirement {
  id: string;
  class: SecurityAssuranceClass;
  family: string;
  component: string;
  element: string;
  status: SecurityRequirementStatus;
  evidence: AssuranceEvidence[];
  evaluation: EvaluationDetails;
  dependencies: string[];
}

export type SecurityAssuranceClass = 
  | 'ACM' // Configuration Management
  | 'ADO' // Delivery and Operation
  | 'ADV' // Development
  | 'AGD' // Guidance Documents
  | 'ALC' // Life-cycle Support
  | 'ATE' // Tests
  | 'AVA' // Vulnerability Assessment
  | 'APE'; // Protection Profile Evaluation

export interface AssuranceEvidence {
  type: EvidenceType;
  description: string;
  location: string;
  quality: EvidenceQuality;
  coverage: number; // 0-100
  confidence: ConfidenceLevel;
}

export type EvidenceType = 
  | 'DOCUMENTATION' 
  | 'TEST_RESULTS' 
  | 'CODE_ANALYSIS' 
  | 'DESIGN_ANALYSIS' 
  | 'VULNERABILITY_ANALYSIS' 
  | 'CONFIGURATION_ANALYSIS';

export type EvidenceQuality = 'EXCELLENT' | 'GOOD' | 'ADEQUATE' | 'POOR' | 'INSUFFICIENT';

export interface EvaluationDetails {
  evaluator: string;
  evaluationDate: Date;
  verdict: EvaluationVerdict;
  confidence: ConfidenceLevel;
  workUnits: number;
  findings: EvaluationFinding[];
}

export type EvaluationVerdict = 'PASS' | 'FAIL' | 'INCONCLUSIVE';

export interface EvaluationFinding {
  id: string;
  severity: DeviationSeverity;
  category: string;
  description: string;
  impact: string;
  recommendation: string;
  status: 'OPEN' | 'CLOSED' | 'MITIGATED';
}

/**
 * Protection Profile Assessment
 */
export interface ProtectionProfileAssessment {
  id: string;
  name: string;
  version: string;
  category: ProtectionProfileCategory;
  applicability: string[];
  securityObjectives: SecurityObjective[];
  securityRequirements: SecurityRequirement[];
  assuranceLevel: number; // 1-7
  complianceScore: number; // 0-100
  gaps: ProtectionProfileGap[];
}

export type ProtectionProfileCategory = 
  | 'OPERATING_SYSTEMS' 
  | 'DATABASES' 
  | 'NETWORK_DEVICES' 
  | 'SMART_CARDS' 
  | 'APPLICATIONS' 
  | 'MOBILE_DEVICES' 
  | 'CLOUD_SERVICES';

export interface SecurityObjective {
  id: string;
  name: string;
  description: string;
  rationale: string;
  threats: string[];
  policies: string[];
  assumptions: string[];
}

export interface SecurityRequirement {
  id: string;
  type: 'FUNCTIONAL' | 'ASSURANCE';
  requirement: string;
  rationale: string;
  dependencies: string[];
  operations: SecurityOperation[];
}

export interface SecurityOperation {
  type: 'ASSIGNMENT' | 'ITERATION' | 'REFINEMENT' | 'SELECTION';
  description: string;
  value: string;
}

export interface ProtectionProfileGap {
  id: string;
  area: string;
  description: string;
  impact: Impact;
  recommendation: string;
  effort: EffortEstimate;
}

/**
 * Security Target Assessment
 */
export interface SecurityTargetAssessment {
  id: string;
  name: string;
  version: string;
  target: SecurityTarget;
  conformance: ConformanceAssessment;
  securityProblemDefinition: SecurityProblemDefinition;
  securityObjectives: SecurityObjective[];
  securityRequirements: SecurityRequirement[];
  rationaleAnalysis: RationaleAnalysis;
  complianceScore: number; // 0-100
  gaps: SecurityTargetGap[];
}

export interface SecurityTarget {
  toeDescription: TOEDescription;
  toeOverview: string;
  toeSecurityEnvironment: SecurityEnvironment;
  physicalScope: string[];
  logicalScope: string[];
}

export interface TOEDescription {
  type: string;
  version: string;
  description: string;
  majorFunctions: string[];
  physicalBoundaries: string[];
  logicalBoundaries: string[];
}

export interface SecurityEnvironment {
  threats: ThreatDefinition[];
  organizationalSecurityPolicies: SecurityPolicy[];
  assumptions: SecurityAssumption[];
}

export interface ThreatDefinition {
  id: string;
  name: string;
  description: string;
  threatAgent: string;
  asset: string;
  adversaryExpertise: ExpertiseLevel;
  resourcesRequired: ResourceLevel;
}

export type ExpertiseLevel = 'BASIC' | 'ENHANCED' | 'MODERATE' | 'HIGH';
export type ResourceLevel = 'LOW' | 'MODERATE' | 'HIGH';

export interface SecurityPolicy {
  id: string;
  name: string;
  description: string;
  rules: string[];
  applicability: string[];
}

export interface SecurityAssumption {
  id: string;
  name: string;
  description: string;
  rationale: string;
}

export interface ConformanceAssessment {
  protectionProfileConformance: PPConformance;
  packageConformance: PackageConformance;
  demonstratedConformance: boolean;
  strictConformance: boolean;
  complianceScore: number; // 0-100
}

export interface PPConformance {
  conformant: boolean;
  protectionProfile: string;
  version: string;
  deviations: ConformanceDeviation[];
}

export interface PackageConformance {
  conformant: boolean;
  packages: string[];
  deviations: ConformanceDeviation[];
}

export interface ConformanceDeviation {
  id: string;
  type: 'ADDITION' | 'OMISSION' | 'MODIFICATION';
  description: string;
  rationale: string;
  impact: Impact;
}

export interface SecurityProblemDefinition {
  assets: Asset[];
  threatAnalysis: ThreatAnalysis;
  vulnerabilityAnalysis: VulnerabilityRiskAnalysis;
  riskAssessment: RiskAssessment;
}

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  value: AssetValue;
  description: string;
  securityAttributes: SecurityAttribute[];
}

export type AssetType = 'DATA' | 'FUNCTIONALITY' | 'SYSTEM' | 'REPUTATION' | 'AVAILABILITY';
export type AssetValue = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface SecurityAttribute {
  attribute: 'CONFIDENTIALITY' | 'INTEGRITY' | 'AVAILABILITY' | 'AUTHENTICITY' | 'NON_REPUDIATION';
  value: AssetValue;
  rationale: string;
}

export interface ThreatAnalysis {
  threats: ThreatDefinition[];
  threatModels: ThreatModel[];
  attackScenarios: AttackScenario[];
}

export interface ThreatModel {
  id: string;
  name: string;
  description: string;
  methodology: string;
  scope: string[];
  threats: string[];
}

export interface AttackScenario {
  id: string;
  name: string;
  description: string;
  attackPath: AttackStep[];
  likelihood: Probability;
  impact: Impact;
  riskLevel: RiskLevel;
}

export interface AttackStep {
  step: number;
  action: string;
  preconditions: string[];
  postconditions: string[];
  difficulty: ExpertiseLevel;
  detectability: DetectabilityLevel;
}

export type DetectabilityLevel = 'EASY' | 'MODERATE' | 'DIFFICULT' | 'INFEASIBLE';

export interface RationaleAnalysis {
  objectiveRationale: ObjectiveRationale[];
  requirementRationale: RequirementRationale[];
  dependencyAnalysis: DependencyAnalysis[];
  completenessAnalysis: CompletenessAnalysis;
}

export interface ObjectiveRationale {
  objectiveId: string;
  threats: string[];
  policies: string[];
  assumptions: string[];
  rationale: string;
  traceability: string[];
}

export interface RequirementRationale {
  requirementId: string;
  objectives: string[];
  rationale: string;
  dependencies: string[];
  iterations: string[];
}

export interface DependencyAnalysis {
  requirementId: string;
  dependencies: string[];
  satisfiedBy: string[];
  analysis: string;
  recommendations: string[];
}

export interface CompletenessAnalysis {
  objectiveCoverage: number; // 0-100
  threatCoverage: number; // 0-100
  requirementCoverage: number; // 0-100
  gaps: string[];
  recommendations: string[];
}

export interface SecurityTargetGap {
  id: string;
  category: 'THREATS' | 'OBJECTIVES' | 'REQUIREMENTS' | 'RATIONALE' | 'CONFORMANCE';
  description: string;
  impact: Impact;
  recommendation: string;
  effort: EffortEstimate;
}

/**
 * Evaluation Result
 */
export interface EvaluationResult {
  id: string;
  evaluationFacility: string;
  evaluationDate: Date;
  targetEAL: number;
  achievedEAL: number;
  overallVerdict: EvaluationVerdict;
  classResults: EvaluationClassResult[];
  vulnerabilityAssessment: VulnerabilityAssessmentResult;
  certificate: CertificateDetails;
  maintenance: MaintenanceRequirements;
}

export interface EvaluationClassResult {
  assuranceClass: SecurityAssuranceClass;
  verdict: EvaluationVerdict;
  workUnits: number;
  findings: EvaluationFinding[];
  evidence: AssuranceEvidence[];
}

export interface VulnerabilityAssessmentResult {
  vulnerabilities: Vulnerability[];
  penetrationTesting: PenetrationTestResult[];
  fuzzTesting: FuzzTestResult[];
  codeAnalysis: CodeAnalysisResult[];
  overallRisk: RiskLevel;
}

export interface Vulnerability {
  id: string;
  name: string;
  description: string;
  severity: VulnerabilitySeverity;
  exploitability: ExploitabilityLevel;
  impact: Impact;
  affected: string[];
  mitigation: string[];
  status: VulnerabilityStatus;
}

export type VulnerabilitySeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
export type ExploitabilityLevel = 'IMMEDIATE' | 'POC' | 'FUNCTIONAL' | 'HIGH' | 'NOT_DEFINED';
export type VulnerabilityStatus = 'OPEN' | 'CONFIRMED' | 'FIXED' | 'MITIGATED' | 'ACCEPTED';

export interface PenetrationTestResult {
  testId: string;
  testType: 'BLACK_BOX' | 'WHITE_BOX' | 'GREY_BOX' | 'NETWORK' | 'APPLICATION';
  scope: string[];
  findings: SecurityFinding[];
  exploits: ExploitResult[];
  recommendations: string[];
}

export interface SecurityFinding {
  id: string;
  category: string;
  description: string;
  severity: VulnerabilitySeverity;
  evidence: string[];
  reproduction: string[];
}

export interface ExploitResult {
  id: string;
  vulnerability: string;
  exploitCode: string;
  success: boolean;
  impact: string;
  mitigation: string;
}

export interface FuzzTestResult {
  testId: string;
  target: string;
  testCases: number;
  crashes: number;
  uniqueCrashes: number;
  coverage: number; // 0-100
  findings: SecurityFinding[];
}

export interface CodeAnalysisResult {
  tool: string;
  version: string;
  scanDate: Date;
  linesOfCode: number;
  findings: CodeFinding[];
  metrics: CodeQualityMetrics;
}

export interface CodeFinding {
  id: string;
  rule: string;
  severity: VulnerabilitySeverity;
  category: string;
  file: string;
  line: number;
  description: string;
  recommendation: string;
}

export interface CodeQualityMetrics {
  complexity: number;
  duplication: number; // percentage
  coverage: number; // percentage
  maintainability: string;
  reliability: string;
  security: string;
}

export interface CertificateDetails {
  certificateNumber: string;
  issuer: string;
  issuedDate: Date;
  validUntil: Date;
  scope: string;
  conditions: string[];
  restrictions: string[];
}

export interface MaintenanceRequirements {
  reportingRequirements: string[];
  updateProcedures: string[];
  impactAnalysis: string[];
  recertificationTriggers: string[];
}

/**
 * Overall Vulnerability Assessment
 */
export interface VulnerabilityAssessment {
  scope: VulnerabilityScope;
  methodology: string[];
  tools: SecurityTool[];
  findings: VulnerabilityFinding[];
  riskAnalysis: VulnerabilityRiskAnalysis;
  recommendations: VulnerabilityRecommendation[];
}

export interface VulnerabilityScope {
  components: string[];
  interfaces: string[];
  dataFlows: string[];
  exclusions: string[];
  rationale: string;
}

export interface SecurityTool {
  name: string;
  version: string;
  type: SecurityToolType;
  configuration: string;
  coverage: string[];
}

export type SecurityToolType = 
  | 'STATIC_ANALYSIS' 
  | 'DYNAMIC_ANALYSIS' 
  | 'PENETRATION_TESTING' 
  | 'FUZZING' 
  | 'VULNERABILITY_SCANNER' 
  | 'NETWORK_SCANNER';

export interface VulnerabilityFinding {
  id: string;
  category: VulnerabilityCategory;
  description: string;
  severity: VulnerabilitySeverity;
  exploitability: ExploitabilityAssessment;
  impact: ImpactAssessment;
  evidence: string[];
  recommendations: string[];
}

export type VulnerabilityCategory = 
  | 'AUTHENTICATION' 
  | 'AUTHORIZATION' 
  | 'INPUT_VALIDATION' 
  | 'CRYPTOGRAPHY' 
  | 'SESSION_MANAGEMENT' 
  | 'ERROR_HANDLING' 
  | 'LOGGING' 
  | 'CONFIGURATION' 
  | 'ARCHITECTURE';

export interface ExploitabilityAssessment {
  attackVector: AttackVector;
  attackComplexity: AttackComplexity;
  privilegesRequired: PrivilegeLevel;
  userInteraction: UserInteractionRequired;
  scope: ExploitScope;
}

export type AttackVector = 'NETWORK' | 'ADJACENT_NETWORK' | 'LOCAL' | 'PHYSICAL';
export type AttackComplexity = 'LOW' | 'HIGH';
export type PrivilegeLevel = 'NONE' | 'LOW' | 'HIGH';
export type UserInteractionRequired = 'NONE' | 'REQUIRED';
export type ExploitScope = 'UNCHANGED' | 'CHANGED';

export interface ImpactAssessment {
  confidentialityImpact: Impact;
  integrityImpact: Impact;
  availabilityImpact: Impact;
  scope: string[];
}

export interface VulnerabilityRiskAnalysis {
  overallRisk: RiskLevel;
  riskFactors: RiskFactor[];
  riskMatrix: RiskMatrixEntry[];
  treatmentOptions: RiskTreatmentOption[];
}

export interface RiskFactor {
  factor: string;
  value: string;
  weight: number;
  rationale: string;
}

export interface RiskMatrixEntry {
  vulnerability: string;
  likelihood: Probability;
  impact: Impact;
  riskLevel: RiskLevel;
  priority: Priority;
}

export interface RiskTreatmentOption {
  option: RiskTreatmentType;
  description: string;
  cost: number;
  effort: EffortEstimate;
  effectiveness: number; // 0-100
  residualRisk: RiskLevel;
}

export type RiskTreatmentType = 'AVOID' | 'MITIGATE' | 'TRANSFER' | 'ACCEPT';

export interface VulnerabilityRecommendation {
  id: string;
  priority: Priority;
  category: string;
  description: string;
  rationale: string;
  implementation: string[];
  effort: EffortEstimate;
  benefits: string[];
  risks: string[];
}

/**
 * Security Risk Assessment
 */
export interface SecurityRiskAssessment {
  scope: RiskAssessmentScope;
  methodology: string;
  threatLandscape: ThreatLandscape;
  assetInventory: AssetInventory;
  riskAnalysis: SecurityRiskAnalysis;
  riskTreatment: SecurityRiskTreatment;
  monitoringPlan: SecurityMonitoringPlan;
}

export interface RiskAssessmentScope {
  boundaries: string[];
  assets: string[];
  processes: string[];
  interfaces: string[];
  exclusions: string[];
}

export interface ThreatLandscape {
  threatActors: ThreatActor[];
  threatIntelligence: ThreatIntelligence[];
  emergingThreats: EmergingThreat[];
  threatTrends: ThreatTrend[];
}

export interface ThreatActor {
  id: string;
  name: string;
  type: ThreatActorType;
  motivation: string[];
  capabilities: string[];
  resources: ResourceLevel;
  sophistication: ExpertiseLevel;
  intent: string;
}

export type ThreatActorType = 'NATION_STATE' | 'ORGANIZED_CRIME' | 'INSIDER' | 'HACKTIVIST' | 'SCRIPT_KIDDIE';

export interface ThreatIntelligence {
  source: string;
  date: Date;
  reliability: ConfidenceLevel;
  relevance: string;
  indicators: ThreatIndicator[];
  ttps: TacticTechniquesProcedures[];
}

export interface ThreatIndicator {
  type: IndicatorType;
  value: string;
  confidence: ConfidenceLevel;
  context: string;
}

export type IndicatorType = 'IP' | 'DOMAIN' | 'URL' | 'HASH' | 'EMAIL' | 'FILE_PATH' | 'REGISTRY_KEY';

export interface TacticTechniquesProcedures {
  tactic: string;
  technique: string;
  procedure: string;
  mitigation: string[];
  detection: string[];
}

export interface EmergingThreat {
  id: string;
  name: string;
  description: string;
  probability: Probability;
  timeframe: string;
  impact: Impact;
  preparedness: string[];
}

export interface ThreatTrend {
  trend: string;
  direction: 'INCREASING' | 'DECREASING' | 'STABLE';
  timeframe: string;
  implications: string[];
}

export interface AssetInventory {
  assets: Asset[];
  classification: AssetClassification[];
  dependencies: AssetDependency[];
  criticality: AssetCriticality[];
}

export interface AssetClassification {
  assetId: string;
  classification: ClassificationLevel;
  rationale: string;
  handling: string[];
}

export type ClassificationLevel = 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED' | 'TOP_SECRET';

export interface AssetDependency {
  assetId: string;
  dependsOn: string[];
  dependencyType: DependencyType;
  criticality: string;
}

export type DependencyType = 'FUNCTIONAL' | 'DATA' | 'TECHNICAL' | 'PROCEDURAL';

export interface AssetCriticality {
  assetId: string;
  businessCriticality: CriticalityLevel;
  technicalCriticality: CriticalityLevel;
  overallCriticality: CriticalityLevel;
  rationale: string;
}

export type CriticalityLevel = 'VERY_LOW' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface SecurityRiskAnalysis {
  risks: SecurityRisk[];
  riskMatrix: SecurityRiskMatrix;
  aggregatedRisk: AggregatedRisk;
  scenarioAnalysis: RiskScenario[];
}

export interface SecurityRisk {
  id: string;
  name: string;
  description: string;
  category: RiskType;
  assets: string[];
  threats: string[];
  vulnerabilities: string[];
  likelihood: Probability;
  impact: Impact;
  riskLevel: RiskLevel;
  inherentRisk: RiskLevel;
  residualRisk: RiskLevel;
  controls: SecurityControl[];
}

export interface SecurityRiskMatrix {
  matrix: RiskMatrixCell[][];
  scale: RiskScale;
  tolerance: RiskTolerance;
}

export interface RiskMatrixCell {
  likelihood: Probability;
  impact: Impact;
  riskLevel: RiskLevel;
  color: string;
}

export interface RiskScale {
  likelihood: ScaleDefinition[];
  impact: ScaleDefinition[];
}

export interface ScaleDefinition {
  level: string;
  description: string;
  criteria: string[];
}

export interface RiskTolerance {
  acceptable: RiskLevel[];
  tolerable: RiskLevel[];
  unacceptable: RiskLevel[];
}

export interface AggregatedRisk {
  overallRisk: RiskLevel;
  riskByCategory: Record<RiskType, RiskLevel>;
  riskByAsset: Record<string, RiskLevel>;
  riskTrends: RiskTrendData[];
}

export interface RiskTrendData {
  date: Date;
  riskLevel: RiskLevel;
  category?: RiskType;
  driver: string;
}

export interface RiskScenario {
  id: string;
  name: string;
  description: string;
  probability: Probability;
  impact: Impact;
  timeline: string;
  indicators: string[];
  mitigation: string[];
}

export interface SecurityControl {
  id: string;
  name: string;
  type: ControlType;
  category: ControlCategory;
  description: string;
  implementation: ControlImplementation;
  effectiveness: number; // 0-100
  coverage: string[];
  cost: number;
  maintenance: ControlMaintenance;
}

export type ControlType = 'PREVENTIVE' | 'DETECTIVE' | 'CORRECTIVE' | 'COMPENSATING';
export type ControlCategory = 'TECHNICAL' | 'ADMINISTRATIVE' | 'PHYSICAL';

export interface ControlImplementation {
  status: ImplementationStatus;
  maturity: MaturityLevel;
  coverage: number; // 0-100
  gaps: string[];
  evidence: string[];
}

export type ImplementationStatus = 'PLANNED' | 'IN_PROGRESS' | 'IMPLEMENTED' | 'OPERATIONAL' | 'NOT_IMPLEMENTED';

export interface ControlMaintenance {
  frequency: MaintenanceFrequency;
  responsibilities: string[];
  procedures: string[];
  lastReview: Date;
  nextReview: Date;
}

export type MaintenanceFrequency = 'CONTINUOUS' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY';

export interface SecurityRiskTreatment {
  strategy: RiskStrategy;
  treatments: RiskTreatment[];
  plan: TreatmentPlan;
  monitoring: TreatmentMonitoring;
}

export interface RiskStrategy {
  approach: string;
  principles: string[];
  objectives: string[];
  constraints: string[];
}

export interface RiskTreatment {
  riskId: string;
  option: RiskTreatmentType;
  rationale: string;
  controls: string[];
  cost: number;
  timeline: string;
  owner: string;
  success: SuccessCriteria[];
}

export interface SuccessCriteria {
  criterion: string;
  metric: string;
  target: string;
  measurement: string;
}

export interface TreatmentPlan {
  phases: TreatmentPhase[];
  milestones: TreatmentMilestone[];
  dependencies: string[];
  resources: TreatmentResource[];
}

export interface TreatmentPhase {
  phase: string;
  description: string;
  duration: string;
  activities: string[];
  deliverables: string[];
  success: string[];
}

export interface TreatmentMilestone {
  milestone: string;
  date: Date;
  criteria: string[];
  dependencies: string[];
}

export interface TreatmentResource {
  type: ResourceType;
  description: string;
  quantity: number;
  cost: number;
  availability: string;
}

export type ResourceType = 'PERSONNEL' | 'TECHNOLOGY' | 'BUDGET' | 'TIME' | 'EXTERNAL';

export interface TreatmentMonitoring {
  kpis: TreatmentKPI[];
  reporting: ReportingRequirement[];
  review: ReviewSchedule;
  escalation: EscalationProcedure[];
}

export interface TreatmentKPI {
  name: string;
  description: string;
  metric: string;
  target: string;
  frequency: MaintenanceFrequency;
  owner: string;
}

export interface ReportingRequirement {
  report: string;
  frequency: MaintenanceFrequency;
  audience: string[];
  content: string[];
  format: string;
}

export interface ReviewSchedule {
  frequency: MaintenanceFrequency;
  participants: string[];
  agenda: string[];
  decisions: string[];
}

export interface EscalationProcedure {
  trigger: string;
  level: string;
  timeframe: string;
  contacts: string[];
  actions: string[];
}

export interface SecurityMonitoringPlan {
  objectives: string[];
  scope: string[];
  metrics: SecurityMetric[];
  indicators: SecurityIndicator[];
  thresholds: SecurityThreshold[];
  procedures: MonitoringProcedure[];
}

export interface SecurityMetric {
  name: string;
  description: string;
  calculation: string;
  unit: string;
  frequency: MaintenanceFrequency;
  target: string;
  tolerance: string;
}

export interface SecurityIndicator {
  name: string;
  description: string;
  source: string;
  collection: string;
  analysis: string;
  alerting: string;
}

export interface SecurityThreshold {
  metric: string;
  warning: string;
  critical: string;
  actions: ThresholdAction[];
}

export interface ThresholdAction {
  threshold: 'WARNING' | 'CRITICAL';
  action: string;
  owner: string;
  timeframe: string;
}

export interface MonitoringProcedure {
  name: string;
  description: string;
  frequency: MaintenanceFrequency;
  steps: string[];
  tools: string[];
  output: string;
}

/**
 * Security Compliance Gap
 */
export interface SecurityComplianceGap {
  id: string;
  category: SecurityComplianceCategory;
  requirement: string;
  currentState: string;
  requiredState: string;
  gap: string;
  severity: DeviationSeverity;
  impact: Impact;
  effort: EffortEstimate;
  recommendation: string;
  timeline: string;
  dependencies: string[];
}

export type SecurityComplianceCategory = 
  | 'SECURITY_FUNCTIONAL_REQUIREMENTS' 
  | 'SECURITY_ASSURANCE_REQUIREMENTS' 
  | 'PROTECTION_PROFILE_CONFORMANCE' 
  | 'EVALUATION_ACTIVITIES' 
  | 'VULNERABILITY_ASSESSMENT' 
  | 'RISK_MANAGEMENT' 
  | 'DOCUMENTATION' 
  | 'TESTING';

// ===== UPDATE EXISTING TYPES =====

// Union type for all compliance results - updated to include ISO 15408
export type ComplianceResult = BABOKComplianceResult | PMBOKComplianceResult | DMBOKComplianceResult | ISO15408ComplianceResult;

/**
 * Analysis Request and Response Types
 */
export interface AnalysisRequest {
  requestId: string;
  projectData: ProjectData;
  enabledStandards: ('BABOK_V3' | 'PMBOK_7' | 'DMBOK_2' | 'ISO_15408')[];
  analysisOptions: AnalysisOptions;
  requestDate: Date;
  requestor: string;
}

export interface AnalysisOptions {
  includeIntelligentDeviations: boolean;
  includeCrossStandardAnalysis: boolean;
  generateExecutiveSummary: boolean;
  detailLevel: 'BASIC' | 'DETAILED' | 'COMPREHENSIVE';
  riskAssessmentLevel: 'BASIC' | 'STANDARD' | 'COMPREHENSIVE';
}

export interface AnalysisResponse {
  analysisId: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  results?: DeviationAnalysis;
  error?: string;
  processingTime: number;
  timestamp: Date;
}

export interface StandardsComplianceConfig {
  enabledStandards: ('BABOK_V3' | 'PMBOK_7' | 'DMBOK_2' | 'ISO_15408')[];
  analysisDepth: 'BASIC' | 'STANDARD' | 'COMPREHENSIVE';
  intelligentDeviationThreshold: number; // 0-100
  riskToleranceLevel: RiskLevel;
  includeRecommendations: boolean;
  generateExecutiveSummary: boolean;
  outputFormat: 'JSON' | 'PDF' | 'BOTH';
}

// ===== MISSING TYPE DEFINITIONS =====

/**
 * Basic enums and common types
 */
export type Industry = 
  | 'TECHNOLOGY' 
  | 'HEALTHCARE' 
  | 'FINANCE' 
  | 'MANUFACTURING' 
  | 'RETAIL' 
  | 'GOVERNMENT' 
  | 'EDUCATION' 
  | 'ENERGY' 
  | 'TELECOMMUNICATIONS' 
  | 'OTHER';

export type ProjectType = 
  | 'SOFTWARE_DEVELOPMENT' 
  | 'INFRASTRUCTURE' 
  | 'DATA_MIGRATION' 
  | 'BUSINESS_TRANSFORMATION' 
  | 'COMPLIANCE' 
  | 'RESEARCH' 
  | 'MAINTENANCE' 
  | 'OTHER';

export type ProjectComplexity = 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';

export type ComplianceStatus = 'COMPLIANT' | 'PARTIALLY_COMPLIANT' | 'NON_COMPLIANT' | 'NOT_ASSESSED' | 'FULLY_COMPLIANT' | 'MOSTLY_COMPLIANT';

export type DeviationSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type RiskLevel = 'VERY_LOW' | 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';

export type Impact = 'NEGLIGIBLE' | 'MINOR' | 'MODERATE' | 'MAJOR' | 'SEVERE';

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type Probability = 'VERY_LOW' | 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';

export type ConfidenceLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';

export type MaturityLevel = 'INITIAL' | 'MANAGED' | 'DEFINED' | 'QUANTITATIVELY_MANAGED' | 'OPTIMIZING';

export type DataMaturityLevel = 'AD_HOC' | 'REPEATABLE' | 'DEFINED' | 'MANAGED' | 'OPTIMIZED';

export type RiskType = 
  | 'OPERATIONAL' 
  | 'TECHNICAL' 
  | 'FINANCIAL' 
  | 'REGULATORY' 
  | 'STRATEGIC' 
  | 'REPUTATIONAL' 
  | 'SECURITY' 
  | 'PRIVACY'
  | 'COMPLIANCE';

/**
 * Project-related types
 */
export interface RegulatoryRequirement {
  id: string;
  name: string;
  description: string;
  category: string;
  mandatoryCompliance: boolean;
  deadline?: Date;
  authority: string;
  penalties: string[];
}

export type Methodology = 
  | 'AGILE' 
  | 'WATERFALL' 
  | 'HYBRID' 
  | 'SCRUM' 
  | 'KANBAN' 
  | 'LEAN' 
  | 'PRINCE2' 
  | 'OTHER';

export interface ProjectDocument {
  id: string;
  name: string;
  type: DocumentType;
  version: string;
  status: DocumentStatus;
  author: string;
  lastModified: Date;
  content?: string;
}

export type DocumentType = 
  | 'REQUIREMENTS' 
  | 'DESIGN' 
  | 'ARCHITECTURE' 
  | 'TEST_PLAN' 
  | 'USER_GUIDE' 
  | 'TECHNICAL_SPEC' 
  | 'PROJECT_PLAN' 
  | 'RISK_REGISTER';

export type DocumentStatus = 'DRAFT' | 'REVIEW' | 'APPROVED' | 'PUBLISHED' | 'ARCHIVED';

export interface ProjectProcess {
  id: string;
  name: string;
  description: string;
  category: ProcessCategory;
  maturity: MaturityLevel;
  owner: string;
  inputs: string[];
  outputs: string[];
  controls: string[];
}

export type ProcessCategory = 
  | 'PLANNING' 
  | 'EXECUTION' 
  | 'MONITORING' 
  | 'CONTROL' 
  | 'CLOSING' 
  | 'SUPPORT';

export interface ProjectDeliverable {
  id: string;
  name: string;
  description: string;
  type: DeliverableType;
  status: DeliverableStatus;
  dueDate: Date;
  owner: string;
  dependencies: string[];
  qualityCriteria: string[];
}

export type DeliverableType = 
  | 'DOCUMENT' 
  | 'SOFTWARE' 
  | 'HARDWARE' 
  | 'SERVICE' 
  | 'TRAINING' 
  | 'PROCESS' 
  | 'OTHER';

export type DeliverableStatus = 
  | 'NOT_STARTED' 
  | 'IN_PROGRESS' 
  | 'COMPLETED' 
  | 'DELIVERED' 
  | 'ACCEPTED' 
  | 'REJECTED';

export interface GovernanceStructure {
  steeringCommittee: CommitteeMember[];
  projectBoard: CommitteeMember[];
  workingGroups: WorkingGroup[];
  decisionMakingProcess: string;
  escalationPaths: EscalationPath[];
}

export interface CommitteeMember {
  name: string;
  role: string;
  organization: string;
  responsibilities: string[];
  authority: AuthorityLevel;
}

export type AuthorityLevel = 'ADVISORY' | 'DECISION_MAKING' | 'APPROVAL' | 'EXECUTIVE';

export interface WorkingGroup {
  name: string;
  purpose: string;
  members: string[];
  chair: string;
  meetingFrequency: string;
}

export interface EscalationPath {
  level: number;
  role: string;
  timeframe: string;
  criteria: string[];
}

export interface ProjectMetadata {
  createdDate: Date;
  lastUpdated: Date;
  version: string;
  tags: string[];
  customFields: Record<string, any>;
}

/**
 * Compliance Assessment Types
 */
export interface ComplianceIssue {
  id: string;
  severity: DeviationSeverity;
  category: string;
  description: string;
  requirement: string;
  currentState: string;
  expectedState: string;
  impact: Impact;
  recommendation: string;
  effort: EffortEstimate;
}

export interface EffortEstimate {
  hours: number;
  cost: number;
  resources: ResourceRequirement[];
  duration: string;
  complexity: ProjectComplexity;
}

export interface ResourceRequirement {
  type: ResourceType;
  skill: string;
  quantity: number;
  duration: string;
}

export interface ComplianceStrength {
  id: string;
  category: string;
  description: string;
  standard: string;
  evidence: string[];
  value: string;
}

export interface ComplianceRecommendation {
  id: string;
  priority: Priority;
  category: string;
  description: string;
  rationale: string;
  implementation: string[];
  benefits: string[];
  risks: string[];
  effort: EffortEstimate;
  timeline: string;
}

/**
 * Knowledge Area and Assessment Types
 */
export interface KnowledgeAreaScore {
  area: string;
  score: number; // 0-100
  maturity: MaturityLevel;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  evidence: string[];
}

export interface CompetencyAssessment {
  competency: string;
  level: CompetencyLevel;
  evidence: string[];
  gaps: string[];
  developmentPlan: string[];
}

export type CompetencyLevel = 'AWARENESS' | 'WORKING' | 'PRACTITIONER' | 'EXPERT' | 'THOUGHT_LEADER';

export interface TechniqueUsageAnalysis {
  technique: string;
  usage: UsageLevel;
  effectiveness: number; // 0-100
  context: string[];
  recommendations: string[];
}

export type UsageLevel = 'NOT_USED' | 'RARELY' | 'SOMETIMES' | 'FREQUENTLY' | 'ALWAYS';

export interface PerformanceDomainScore {
  domain: string;
  score: number; // 0-100
  maturity: MaturityLevel;
  practices: PracticeAssessment[];
  outcomes: OutcomeAssessment[];
  recommendations: string[];
}

export interface PracticeAssessment {
  practice: string;
  implemented: boolean;
  effectiveness: number; // 0-100
  evidence: string[];
  gaps: string[];
}

export interface OutcomeAssessment {
  outcome: string;
  achieved: boolean;
  metrics: MetricValue[];
  evidence: string[];
}

export interface MetricValue {
  metric: string;
  value: number;
  unit: string;
  target?: number;
  trend: TrendDirection;
}

export type TrendDirection = 'IMPROVING' | 'STABLE' | 'DECLINING' | 'UNKNOWN';

export interface PrincipleAlignment {
  principle: string;
  alignment: AlignmentLevel;
  evidence: string[];
  gaps: string[];
  actions: string[];
}

export type AlignmentLevel = 'FULLY_ALIGNED' | 'MOSTLY_ALIGNED' | 'PARTIALLY_ALIGNED' | 'NOT_ALIGNED';

export interface LifecycleAssessment {
  phase: string;
  completeness: number; // 0-100
  quality: QualityLevel;
  deliverables: DeliverableAssessment[];
  gates: GateAssessment[];
}

export type QualityLevel = 'POOR' | 'FAIR' | 'GOOD' | 'EXCELLENT';

export interface DeliverableAssessment {
  deliverable: string;
  status: DeliverableStatus;
  quality: QualityLevel;
  completeness: number; // 0-100
  issues: string[];
}

export interface GateAssessment {
  gate: string;
  passed: boolean;
  criteria: CriteriaAssessment[];
  conditions: string[];
}

export interface CriteriaAssessment {
  criterion: string;
  met: boolean;
  evidence: string[];
  gaps: string[];
}

export interface ValueDeliveryAssessment {
  value: ValueCategory[];
  benefits: BenefitRealization[];
  metrics: ValueMetric[];
  stakeholderSatisfaction: SatisfactionLevel;
}

export interface ValueCategory {
  category: string;
  description: string;
  quantified: boolean;
  metrics: string[];
  evidence: string[];
}

export interface BenefitRealization {
  benefit: string;
  planned: number;
  actual: number;
  unit: string;
  realizationDate: Date;
  status: RealizationStatus;
}

export type RealizationStatus = 'PLANNED' | 'IN_PROGRESS' | 'REALIZED' | 'AT_RISK' | 'NOT_REALIZED';

export interface ValueMetric {
  metric: string;
  baseline: number;
  target: number;
  current: number;
  unit: string;
  trend: TrendDirection;
}

export type SatisfactionLevel = 'VERY_DISSATISFIED' | 'DISSATISFIED' | 'NEUTRAL' | 'SATISFIED' | 'VERY_SATISFIED';

/**
 * Data Management Types
 */
export interface DataFunctionScore {
  function: string;
  score: number; // 0-100
  maturity: MaturityLevel;
  capabilities: CapabilityAssessment[];
  processes: ProcessAssessment[];
  tools: ToolAssessment[];
  governance: GovernanceAssessment[];
}

export interface CapabilityAssessment {
  capability: string;
  maturity: MaturityLevel;
  effectiveness: number; // 0-100
  coverage: number; // 0-100
  gaps: string[];
}

export interface ProcessAssessment {
  process: string;
  defined: boolean;
  documented: boolean;
  automated: boolean;
  monitored: boolean;
  maturity: MaturityLevel;
}

export interface ToolAssessment {
  tool: string;
  category: ToolCategory;
  usage: UsageLevel;
  effectiveness: number; // 0-100
  integration: IntegrationLevel;
  issues: string[];
}

export type ToolCategory = 
  | 'DATA_MODELING' 
  | 'DATA_INTEGRATION' 
  | 'DATA_QUALITY' 
  | 'DATA_GOVERNANCE' 
  | 'ANALYTICS' 
  | 'VISUALIZATION' 
  | 'METADATA_MANAGEMENT';

export type IntegrationLevel = 'NONE' | 'BASIC' | 'MODERATE' | 'ADVANCED' | 'FULLY_INTEGRATED';

export interface GovernanceAssessment {
  area: string;
  policies: PolicyAssessment[];
  procedures: ProcedureAssessment[];
  roles: RoleAssessment[];
  compliance: ComplianceLevel;
}

export interface PolicyAssessment {
  policy: string;
  exists: boolean;
  current: boolean;
  communicated: boolean;
  enforced: boolean;
  effectiveness: number; // 0-100
}

export interface ProcedureAssessment {
  procedure: string;
  documented: boolean;
  followed: boolean;
  automated: boolean;
  monitored: boolean;
  effectiveness: number; // 0-100
}

export interface RoleAssessment {
  role: string;
  defined: boolean;
  assigned: boolean;
  trained: boolean;
  accountable: boolean;
  effectiveness: number; // 0-100
}

export type ComplianceLevel = 'NON_COMPLIANT' | 'PARTIALLY_COMPLIANT' | 'MOSTLY_COMPLIANT' | 'FULLY_COMPLIANT';

export interface GovernanceFrameworkAssessment {
  framework: string;
  implementation: ImplementationLevel;
  maturity: MaturityLevel;
  components: FrameworkComponent[];
  effectiveness: number; // 0-100
  gaps: string[];
}

export type ImplementationLevel = 'NOT_IMPLEMENTED' | 'PARTIALLY_IMPLEMENTED' | 'MOSTLY_IMPLEMENTED' | 'FULLY_IMPLEMENTED';

export interface FrameworkComponent {
  component: string;
  implemented: boolean;
  maturity: MaturityLevel;
  effectiveness: number; // 0-100
  dependencies: string[];
}

/**
 * Deviation Analysis Types
 */
export interface DeviationRiskAssessment {
  overallRisk: RiskLevel;
  riskCategories: RiskCategoryAssessment[];
  mitigationStrategies: MitigationStrategy[];
  contingencyPlans: ContingencyPlan[];
}

export interface RiskCategoryAssessment {
  category: RiskType;
  probability: Probability;
  impact: Impact;
  riskLevel: RiskLevel;
  factors: RiskFactor[];
  controls: string[];
}

export interface MitigationStrategy {
  risk: string;
  strategy: string;
  actions: string[];
  owner: string;
  timeline: string;
  effectiveness: number; // 0-100
}

export interface ContingencyPlan {
  trigger: string;
  actions: string[];
  resources: string[];
  timeline: string;
  owner: string;
}

export interface ImpactAnalysis {
  businessImpact: BusinessImpact;
  technicalImpact: TechnicalImpact;
  operationalImpact: OperationalImpact;
  financialImpact: FinancialImpact;
  stakeholderImpact: StakeholderImpact[];
}

export interface BusinessImpact {
  processes: ProcessImpact[];
  objectives: ObjectiveImpact[];
  performance: PerformanceImpact[];
  reputation: ReputationImpact;
}

export interface ProcessImpact {
  process: string;
  impactType: ImpactType;
  severity: DeviationSeverity;
  description: string;
  mitigation: string[];
}

export type ImpactType = 'DISRUPTION' | 'DELAY' | 'QUALITY' | 'COST' | 'COMPLIANCE' | 'EFFICIENCY';

export interface ObjectiveImpact {
  objective: string;
  impactLevel: Impact;
  probability: Probability;
  timeframe: string;
  description: string;
}

export interface PerformanceImpact {
  metric: string;
  baseline: number;
  projected: number;
  variance: number;
  unit: string;
  significance: string;
}

export interface ReputationImpact {
  stakeholders: string[];
  severity: DeviationSeverity;
  duration: string;
  mitigation: string[];
}

export interface TechnicalImpact {
  systems: SystemImpact[];
  infrastructure: InfrastructureImpact[];
  data: DataImpact[];
  security: SecurityImpact[];
}

export interface SystemImpact {
  system: string;
  impactType: ImpactType;
  severity: DeviationSeverity;
  dependencies: string[];
  recovery: string[];
}

export interface InfrastructureImpact {
  component: string;
  impactType: ImpactType;
  severity: DeviationSeverity;
  alternatives: string[];
}

export interface DataImpact {
  dataAsset: string;
  impactType: ImpactType;
  severity: DeviationSeverity;
  integrity: boolean;
  availability: boolean;
  confidentiality: boolean;
}

export interface SecurityImpact {
  asset: string;
  threat: string;
  vulnerability: string;
  riskLevel: RiskLevel;
  controls: string[];
}

export interface OperationalImpact {
  areas: OperationalArea[];
  resources: ResourceImpact[];
  processes: ProcessImpact[];
  services: ServiceImpact[];
}

export interface OperationalArea {
  area: string;
  impact: Impact;
  description: string;
  mitigation: string[];
}

export interface ResourceImpact {
  resource: string;
  type: ResourceType;
  impact: Impact;
  availability: string;
  alternatives: string[];
}

export interface ServiceImpact {
  service: string;
  availability: number; // 0-100
  performance: number; // 0-100
  quality: QualityLevel;
  users: number;
}

export interface FinancialImpact {
  directCosts: CostCategory[];
  indirectCosts: CostCategory[];
  opportunityCosts: CostCategory[];
  savings: CostCategory[];
  netImpact: number;
  currency: string;
  timeframe: string;
}

export interface CostCategory {
  category: string;
  amount: number;
  currency: string;
  timeframe: string;
  confidence: ConfidenceLevel;
  assumptions: string[];
}

export interface StakeholderImpact {
  stakeholder: string;
  group: string;
  impact: Impact;
  interests: string[];
  concerns: string[];
  engagement: EngagementLevel;
  influence: InfluenceLevel;
}

export type EngagementLevel = 'UNAWARE' | 'RESISTANT' | 'NEUTRAL' | 'SUPPORTIVE' | 'LEADING';
export type InfluenceLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';

export interface DeviationRecommendation {
  id: string;
  type: RecommendationType;
  priority: Priority;
  description: string;
  rationale: string;
  benefits: string[];
  risks: string[];
  implementation: ImplementationPlan;
  success: SuccessMetrics[];
}

export type RecommendationType = 
  | 'IMMEDIATE_ACTION' 
  | 'PLANNED_IMPROVEMENT' 
  | 'RISK_MITIGATION' 
  | 'PROCESS_CHANGE' 
  | 'TOOL_ADOPTION' 
  | 'TRAINING' 
  | 'GOVERNANCE';

export interface ImplementationPlan {
  phases: ImplementationPhase[];
  timeline: string;
  resources: ResourceRequirement[];
  dependencies: string[];
  milestones: Milestone[];
}

export interface ImplementationPhase {
  phase: string;
  description: string;
  duration: string;
  activities: string[];
  deliverables: string[];
  criteria: string[];
}

export interface Milestone {
  name: string;
  date: Date;
  criteria: string[];
  dependencies: string[];
  deliverables: string[];
}

export interface SuccessMetrics {
  metric: string;
  baseline: number;
  target: number;
  unit: string;
  measurement: string;
  frequency: MaintenanceFrequency;
}

export interface ComplianceMatrix {
  standards: StandardCompliance[];
  crossReferences: CrossReference[];
  coverage: CoverageAnalysis;
  gaps: GapAnalysis[];
}

export interface StandardCompliance {
  standard: string;
  version: string;
  overallScore: number; // 0-100
  sections: SectionCompliance[];
  status: ComplianceStatus;
}

export interface SectionCompliance {
  section: string;
  score: number; // 0-100
  status: ComplianceStatus;
  requirements: RequirementCompliance[];
}

export interface RequirementCompliance {
  requirement: string;
  status: ComplianceStatus;
  evidence: string[];
  gaps: string[];
  recommendations: string[];
}

export interface CrossReference {
  requirement1: string;
  standard1: string;
  requirement2: string;
  standard2: string;
  relationship: RelationshipType;
  conflicts: string[];
}

export type RelationshipType = 'EQUIVALENT' | 'SIMILAR' | 'RELATED' | 'CONFLICTING' | 'COMPLEMENTARY';

export interface CoverageAnalysis {
  totalRequirements: number;
  coveredRequirements: number;
  coveragePercentage: number;
  gaps: string[];
  overlaps: string[];
}

export interface GapAnalysis {
  standard: string;
  section: string;
  gap: string;
  impact: Impact;
  effort: EffortEstimate;
  priority: Priority;
  recommendation: string;
}

export interface ExecutiveSummary {
  overallAssessment?: any;
  keyFindings: KeyFinding[];
  criticalDeviations?: any[];
  intelligentDeviations?: any[];
  riskProfile?: any;
  approvalRequired?: any[];
  projectOverview: ProjectOverview;
  complianceStatus: OverallComplianceStatus;
  riskAssessment: ExecutiveRiskAssessment;
  recommendations: ExecutiveRecommendation[];
  nextSteps: NextStep[];
  timeline: ExecutiveTimeline;
  resources: ExecutiveResources;
}

export interface ProjectOverview {
  projectName: string;
  industry: Industry;
  complexity: ProjectComplexity;
  duration: string;
  budget: string;
  teamSize: number;
  keyObjectives: string[];
}

export interface KeyFinding {
  category: string;
  finding: string;
  impact: Impact;
  evidence: string[];
  significance: string;
}

export interface OverallComplianceStatus {
  overallScore: number; // 0-100
  standardScores: StandardScore[];
  trend: TrendDirection;
  keyIssues: string[];
  strengths: string[];
}

export interface StandardScore {
  standard: string;
  score: number; // 0-100
  status: ComplianceStatus;
  criticalIssues: number;
  warnings: number;
}

export interface ExecutiveRiskAssessment {
  overallRisk: RiskLevel;
  keyRisks: ExecutiveRisk[];
  mitigationStatus: string;
  residualRisk: RiskLevel;
}

export interface ExecutiveRisk {
  risk: string;
  probability: Probability;
  impact: Impact;
  riskLevel: RiskLevel;
  mitigation: string;
  owner: string;
}

export interface ExecutiveRecommendation {
  priority: Priority;
  recommendation: string;
  rationale: string;
  benefits: string[];
  effort: string;
  timeline: string;
  owner: string;
}

export interface NextStep {
  step: string;
  owner: string;
  deadline: Date;
  dependencies: string[];
  success: string[];
}

export interface ExecutiveTimeline {
  phases: TimelinePhase[];
  keyMilestones: TimelineMilestone[];
  criticalPath: string[];
}

export interface TimelinePhase {
  phase: string;
  start: Date;
  end: Date;
  objectives: string[];
  deliverables: string[];
}

export interface TimelineMilestone {
  milestone: string;
  date: Date;
  significance: string;
  dependencies: string[];
}

export interface ExecutiveResources {
  totalBudget: number;
  currency: string;
  keyResources: KeyResource[];
  skillGaps: string[];
  externalSupport: string[];
}

export interface KeyResource {
  type: ResourceType;
  description: string;
  quantity: number;
  cost: number;
  timeline: string;
  criticality: string;
}

/**
 * Deviation Analysis Types - Additional
 */
export type DeviationType = 
  | 'PROCESS_DEVIATION' 
  | 'METHODOLOGY_DEVIATION' 
  | 'TOOL_DEVIATION' 
  | 'DOCUMENTATION_DEVIATION' 
  | 'GOVERNANCE_DEVIATION' 
  | 'QUALITY_DEVIATION'
  | 'METHODOLOGY';

export interface DeviationImpact {
  category: ImpactType;
  severity: DeviationSeverity;
  scope: string[];
  stakeholders: string[];
  timeline: string;
  description: string;
}

export type IntelligentDeviationCategory = 
  | 'CONTEXTUAL_ADAPTATION' 
  | 'INNOVATION_DRIVEN' 
  | 'EFFICIENCY_OPTIMIZATION' 
  | 'RISK_MITIGATION' 
  | 'RESOURCE_CONSTRAINT' 
  | 'STAKEHOLDER_PREFERENCE'
  | 'EFFICIENCY_IMPROVEMENT';

export interface StandardApproachDescription {
  approach: string;
  rationale: string;
  benefits: string[];
  requirements: string[];
  assumptions: string[];
}

export interface ProjectApproachDescription {
  approach: string;
  rationale: string;
  benefits: string[];
  implementation: string[];
  constraints: string[];
}

export interface DeviationReasoning {
  primary: string;
  primaryReason?: string;
  supporting: string[];
  supportingReasons?: string[];
  evidence: string[];
  alternatives: AlternativeAnalysis[];
  decisionCriteria: DecisionCriteria[];
  contextualFactors?: any[];
  industryConsiderations?: string[];
  regulatoryDrivers?: string[];
  businessDrivers?: string[];
  technicalDrivers?: string[];
}

export interface AlternativeAnalysis {
  alternative: string;
  pros: string[];
  cons: string[];
  feasibility: string;
  rejected: boolean;
  reason: string;
}

export interface DecisionCriteria {
  criterion: string;
  weight: number;
  standardScore: number;
  projectScore: number;
  rationale: string;
}

export interface DeviationBenefit {
  benefit: string;
  description?: string;
  benefitType?: BenefitCategory;
  category: BenefitCategory;
  quantified: boolean;
  quantifiedValue?: {
    amount: number;
    unit: string;
    confidence: ConfidenceLevel;
    source: string;
  };
  value?: number;
  unit?: string;
  timeframe: string;
  timeline?: string;
  stakeholders: string[];
  evidence?: {
    evidenceType: string;
    source: string;
    description: string;
    reliability: string;
  }[];
}

export type BenefitCategory = 
  | 'COST_REDUCTION' 
  | 'TIME_SAVINGS' 
  | 'QUALITY_IMPROVEMENT' 
  | 'RISK_REDUCTION' 
  | 'EFFICIENCY_GAIN' 
  | 'INNOVATION' 
  | 'STAKEHOLDER_SATISFACTION';

export interface DeviationRisk {
  risk: string;
  riskType?: RiskType;
  category: RiskType;
  probability: Probability;
  impact: Impact;
  riskLevel: RiskLevel;
  severity?: DeviationSeverity;
  timeframe: string;
  indicators: string[];
  affectedStakeholders?: string[];
}

export interface RiskMitigation {
  risk: string;
  strategy: MitigationStrategyType;
  actions: string[];
  owner: string;
  timeline: string;
  cost: number;
  effectiveness: number; // 0-100
  monitoring: string[];
}

export type MitigationStrategyType = 'AVOID' | 'REDUCE' | 'TRANSFER' | 'ACCEPT' | 'MONITOR' | 'MITIGATE';

export interface BusinessJustification {
  strategicAlignment?: string;
  businessValue?: string;
  competitiveAdvantage?: string;
  stakeholderBenefit?: string;
  objectives: string[];
  benefits: BusinessBenefit[];
  costs: BusinessCost[];
  roi: number | {
    investment: number;
    expectedReturn: number;
    roiPercentage: number;
    paybackPeriod: string;
    npv: number;
    irr: number;
  };
  paybackPeriod: string;
  npv?: number;
  sensitivity: SensitivityAnalysis[];
  timeline?: {
    phases: string[];
    milestones: Date[];
    dependencies: string[];
  };
}

export interface BusinessBenefit {
  benefit: string;
  value: number;
  currency: string;
  timeframe: string;
  confidence: ConfidenceLevel;
  assumptions: string[];
}

export interface BusinessCost {
  cost: string;
  value: number;
  currency: string;
  timeframe: string;
  confidence: ConfidenceLevel;
  assumptions: string[];
}

export interface SensitivityAnalysis {
  variable: string;
  baseCase: number;
  optimistic: number;
  pessimistic: number;
  impact: string;
}

export interface TechnicalJustification {
  technicalSuperiority?: string;
  performanceImprovement?: string;
  maintainabilityBenefit?: string;
  scalabilityAdvantage?: string;
  integrationBenefit?: string;
  securityImprovement?: string;
  requirements: TechnicalRequirement[];
  constraints: TechnicalConstraint[];
  dependencies: TechnicalDependency[];
  alternatives: TechnicalAlternative[];
  feasibility: FeasibilityAssessment;
}

export interface TechnicalRequirement {
  requirement: string;
  priority: Priority;
  source: string;
  validation: string;
  traceability: string[];
}

export interface TechnicalConstraint {
  constraint: string;
  type: ConstraintType;
  impact: Impact;
  workaround: string[];
  mitigation: string[];
}

export type ConstraintType = 'TECHNICAL' | 'RESOURCE' | 'TIME' | 'BUDGET' | 'REGULATORY' | 'ORGANIZATIONAL';

export interface TechnicalDependency {
  dependency: string;
  type: DependencyType;
  criticality: string;
  owner: string;
  timeline: string;
  risks: string[];
}

export interface TechnicalAlternative {
  alternative: string;
  description: string;
  pros: string[];
  cons: string[];
  complexity: ProjectComplexity;
  cost: number;
  timeline: string;
  feasibility: string;
}

export interface FeasibilityAssessment {
  technical: FeasibilityRating;
  economic: FeasibilityRating;
  operational: FeasibilityRating;
  schedule: FeasibilityRating;
  overall: FeasibilityRating;
  risks: string[];
  assumptions: string[];
}

export type FeasibilityRating = 'HIGH' | 'MEDIUM' | 'LOW' | 'UNCERTAIN';

export type IntelligentDeviationRecommendation = 
  | 'APPROVE' 
  | 'APPROVE_WITH_CONDITIONS' 
  | 'DEFER' 
  | 'REJECT' 
  | 'REQUIRES_FURTHER_ANALYSIS'
  | 'STRONGLY_APPROVE';

export type ApprovalStatus = 
  | 'PENDING' 
  | 'APPROVED' 
  | 'APPROVED_WITH_CONDITIONS' 
  | 'REJECTED' 
  | 'WITHDRAWN' 
  | 'UNDER_REVIEW';

export type ConflictType = 
  | 'REQUIREMENT_CONFLICT' 
  | 'METHODOLOGY_CONFLICT' 
  | 'PROCESS_CONFLICT' 
  | 'TOOL_CONFLICT' 
  | 'GOVERNANCE_CONFLICT';

export interface ConflictResolution {
  resolution: ResolutionType;
  rationale: string;
  approach: string;
  trade_offs: string[];
  stakeholders: string[];
  approval: string;
}

export type ResolutionType = 
  | 'STANDARD_PRECEDENCE' 
  | 'PROJECT_PRECEDENCE' 
  | 'HYBRID_APPROACH' 
  | 'ESCALATION' 
  | 'WAIVER';

export interface CrossStandardImpact {
  impactType: ImpactType;
  severity: DeviationSeverity;
  affectedStandards: string[];
  consequences: string[];
  mitigation: string[];
}

/**
 * Risk Assessment
 */
export interface RiskAssessment {
  methodology: string;
  scope: string[];
  risks: SecurityRisk[];
  overallRisk: RiskLevel;
  mitigationStrategy: string;
  residualRisk: RiskLevel;
  reviewDate: Date;
}
