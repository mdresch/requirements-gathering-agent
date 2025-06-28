/**
 * Standards Compliance & Deviation Analysis Types
 * 
 * This module defines the core interfaces and types for the Project Standards
 * Compliance & Deviation Analysis framework that analyzes projects against
 * international standards (BABOK, PMBOK, DMBOK) and identifies intelligent
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
  standard: 'BABOK_V3' | 'PMBOK_7' | 'DMBOK_2';
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

// ===== DEVIATION ANALYSIS =====

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
  standard: 'BABOK_V3' | 'PMBOK_7' | 'DMBOK_2';
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
  involvedStandards: ('BABOK_V3' | 'PMBOK_7' | 'DMBOK_2')[];
  conflictType: ConflictType;
  description: string;
  resolution: ConflictResolution;
  impact: CrossStandardImpact;
}

// ===== SUPPORTING TYPES =====

export type Industry = 
  | 'FINANCIAL_SERVICES' 
  | 'HEALTHCARE' 
  | 'GOVERNMENT' 
  | 'TECHNOLOGY' 
  | 'MANUFACTURING' 
  | 'RETAIL' 
  | 'ENERGY' 
  | 'TELECOMMUNICATIONS' 
  | 'OTHER';

export type ProjectType = 
  | 'TRANSFORMATION' 
  | 'IMPLEMENTATION' 
  | 'ENHANCEMENT' 
  | 'COMPLIANCE' 
  | 'INTEGRATION' 
  | 'RESEARCH' 
  | 'OPERATIONS';

export type ProjectComplexity = 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';

export type Methodology = 
  | 'WATERFALL' 
  | 'AGILE' 
  | 'HYBRID' 
  | 'LEAN' 
  | 'KANBAN' 
  | 'SCRUM' 
  | 'SAFe' 
  | 'CUSTOM';

export type ComplianceStatus = 
  | 'FULLY_COMPLIANT' 
  | 'MOSTLY_COMPLIANT' 
  | 'PARTIALLY_COMPLIANT' 
  | 'NON_COMPLIANT' 
  | 'NOT_ASSESSED';

export type DeviationType = 
  | 'METHODOLOGY' 
  | 'PROCESS' 
  | 'DELIVERABLE' 
  | 'GOVERNANCE' 
  | 'TOOLS' 
  | 'TECHNIQUES' 
  | 'ROLES' 
  | 'WORKFLOWS';

export type DeviationSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFORMATIONAL';

export type IntelligentDeviationCategory = 
  | 'EFFICIENCY_IMPROVEMENT' 
  | 'REGULATORY_ADAPTATION' 
  | 'TECHNOLOGY_ENHANCEMENT' 
  | 'STAKEHOLDER_OPTIMIZATION' 
  | 'RISK_MITIGATION' 
  | 'COST_OPTIMIZATION' 
  | 'QUALITY_ENHANCEMENT' 
  | 'TIMELINE_OPTIMIZATION';

export type RiskLevel = 'VERY_LOW' | 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';

export type ConfidenceLevel = 'VERY_LOW' | 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';

export type IntelligentDeviationRecommendation = 
  | 'STRONGLY_APPROVE' 
  | 'APPROVE' 
  | 'APPROVE_WITH_CONDITIONS' 
  | 'REVIEW_REQUIRED' 
  | 'MODIFY_APPROACH' 
  | 'REVERT_TO_STANDARD';

export type ApprovalStatus = 
  | 'PENDING' 
  | 'APPROVED' 
  | 'CONDITIONALLY_APPROVED' 
  | 'REJECTED' 
  | 'UNDER_REVIEW' 
  | 'REQUIRES_ESCALATION';

export type ConflictType = 
  | 'METHODOLOGICAL' 
  | 'PROCEDURAL' 
  | 'DELIVERABLE_FORMAT' 
  | 'GOVERNANCE_STRUCTURE' 
  | 'TERMINOLOGY' 
  | 'TIMING';

// ===== DETAILED INTERFACES =====

export interface ComplianceIssue {
  issueId: string;
  severity: DeviationSeverity;
  category: string;
  description: string;
  standardReference: string;
  currentState: string;
  requiredState: string;
  impact: string;
  remediation: string;
  effort: EffortEstimate;
  priority: Priority;
}

export interface ComplianceStrength {
  strengthId: string;
  category: string;
  description: string;
  standardReference: string;
  benefit: string;
  recommendation: string;
}

export interface ComplianceRecommendation {
  recommendationId: string;
  type: 'IMMEDIATE' | 'SHORT_TERM' | 'LONG_TERM' | 'STRATEGIC';
  priority: Priority;
  description: string;
  rationale: string;
  expectedBenefit: string;
  effort: EffortEstimate;
  dependencies: string[];
  risks: string[];
}

export interface KnowledgeAreaScore {
  area: string;
  score: number;
  maxScore: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

export interface PerformanceDomainScore {
  domain: string;
  score: number;
  maxScore: number;
  maturityLevel: MaturityLevel;
  keyIndicators: string[];
  improvementAreas: string[];
}

export interface DeviationReasoning {
  primaryReason: string;
  supportingReasons: string[];
  contextualFactors: ContextualFactor[];
  industryConsiderations: string[];
  regulatoryDrivers: string[];
  businessDrivers: string[];
  technicalDrivers: string[];
}

export interface DeviationBenefit {
  benefitType: BenefitType;
  description: string;
  quantifiedValue?: QuantifiedValue;
  timeline: string;
  stakeholders: string[];
  evidence: Evidence[];
}

export interface DeviationRisk {
  riskType: RiskType;
  description: string;
  probability: Probability;
  impact: Impact;
  severity: DeviationSeverity;
  timeframe: string;
  affectedStakeholders: string[];
}

export interface BusinessJustification {
  strategicAlignment: string;
  businessValue: string;
  competitiveAdvantage: string;
  stakeholderBenefit: string;
  roi: ROIAnalysis;
  timeline: TimelineAnalysis;
}

export interface TechnicalJustification {
  technicalSuperiority: string;
  performanceImprovement: string;
  maintainabilityBenefit: string;
  scalabilityAdvantage: string;
  integrationBenefit: string;
  securityImprovement: string;
}

export interface ExecutiveSummary {
  overallAssessment: OverallAssessment;
  keyFindings: KeyFinding[];
  criticalDeviations: CriticalDeviationSummary[];
  intelligentDeviations: IntelligentDeviationSummary[];
  riskProfile: RiskProfile;
  recommendations: ExecutiveRecommendation[];
  nextSteps: NextStep[];
  approvalRequired: ApprovalRequirement[];
}

export interface ComplianceMatrix {
  standards: StandardComplianceRow[];
  overallScore: number;
  complianceLevel: ComplianceLevel;
  riskRating: RiskRating;
  auditReadiness: AuditReadiness;
}

// ===== ANALYSIS SUPPORTING TYPES =====

export type MaturityLevel = 'INITIAL' | 'MANAGED' | 'DEFINED' | 'QUANTITATIVELY_MANAGED' | 'OPTIMIZING';
export type Priority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type BenefitType = 'COST_REDUCTION' | 'TIME_SAVINGS' | 'QUALITY_IMPROVEMENT' | 'RISK_REDUCTION' | 'EFFICIENCY_GAIN' | 'STAKEHOLDER_SATISFACTION';
export type RiskType = 'COMPLIANCE' | 'OPERATIONAL' | 'FINANCIAL' | 'REPUTATIONAL' | 'TECHNICAL' | 'STRATEGIC';
export type Probability = 'VERY_LOW' | 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
export type Impact = 'NEGLIGIBLE' | 'MINOR' | 'MODERATE' | 'MAJOR' | 'SEVERE';
export type ComplianceLevel = 'EXCELLENT' | 'GOOD' | 'ACCEPTABLE' | 'NEEDS_IMPROVEMENT' | 'POOR';
export type RiskRating = 'VERY_LOW' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type AuditReadiness = 'FULLY_READY' | 'MOSTLY_READY' | 'PARTIALLY_READY' | 'NOT_READY';

// Union type for all compliance results
export type ComplianceResult = BABOKComplianceResult | PMBOKComplianceResult | DMBOKComplianceResult;

export interface EffortEstimate {
  hours: number;
  cost: number;
  resources: string[];
  duration: string;
  complexity: ProjectComplexity;
}

export interface QuantifiedValue {
  amount: number;
  unit: string;
  currency?: string;
  confidence: ConfidenceLevel;
  source: string;
}

export interface Evidence {
  evidenceType: 'QUANTITATIVE' | 'QUALITATIVE' | 'HISTORICAL' | 'BENCHMARK';
  source: string;
  description: string;
  reliability: ConfidenceLevel;
  data?: any;
}

export interface ROIAnalysis {
  investment: number;
  expectedReturn: number;
  roiPercentage: number;
  paybackPeriod: string;
  npv: number;
  irr: number;
}

export interface OverallAssessment {
  complianceScore: number;
  deviationScore: number;
  riskLevel: RiskLevel;
  recommendation: 'PROCEED' | 'PROCEED_WITH_CONDITIONS' | 'REQUIRES_CHANGES' | 'DO_NOT_PROCEED';
  executiveSummary: string;
}

export interface StandardComplianceRow {
  standard: 'BABOK_V3' | 'PMBOK_7' | 'DMBOK_2';
  score: number;
  status: ComplianceStatus;
  criticalIssues: number;
  deviations: number;
  strengths: number;
}

// ===== CONFIGURATION INTERFACES =====

export interface StandardsComplianceConfig {
  enabledStandards: ('BABOK_V3' | 'PMBOK_7' | 'DMBOK_2')[];
  deviationThresholds: {
    critical: number;
    warning: number;
    acceptable: number;
  };
  analysisDepth: 'BASIC' | 'STANDARD' | 'COMPREHENSIVE' | 'DETAILED';
  autoApprovalThreshold: number;
  reportFormats: ('PDF' | 'HTML' | 'JSON' | 'MARKDOWN' | 'EXCEL')[];
  includeExecutiveSummary: boolean;
  includeDetailedAnalysis: boolean;
  includeRecommendations: boolean;
  customWeights?: StandardWeights;
}

export interface StandardWeights {
  babok: number;
  pmbok: number;
  dmbok: number;
  intelligentDeviations: number;
  crossStandardAlignment: number;
}

// ===== API INTERFACES =====

export interface AnalysisRequest {
  projectData: ProjectData;
  config: StandardsComplianceConfig;
  requestId?: string;
  requestedBy: string;
  analysisType: 'FULL' | 'COMPLIANCE_ONLY' | 'DEVIATIONS_ONLY' | 'EXECUTIVE_SUMMARY';
}

export interface AnalysisResponse {
  analysisId: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'FAILED';
  results?: DeviationAnalysis;
  error?: string;
  processingTime: number;
  timestamp: Date;
}

export interface DeviationApprovalRequest {
  deviationId: string;
  approver: string;
  decision: 'APPROVE' | 'REJECT' | 'REQUEST_CHANGES';
  comments: string;
  conditions?: string[];
}

export interface ComplianceDashboardData {
  projectSummary: ProjectSummary;
  complianceOverview: ComplianceOverview;
  deviationSummary: DeviationSummaryStats;
  riskMetrics: RiskMetrics;
  trends: ComplianceTrends;
  actionItems: ActionItem[];
  recentActivity: ActivityLog[];
}

// ===== ADDITIONAL SUPPORTING INTERFACES =====

export interface ProjectSummary {
  projectId: string;
  projectName: string;
  status: string;
  lastAnalyzed: Date;
  nextReview: Date;
  overallScore: number;
  trendDirection: 'IMPROVING' | 'STABLE' | 'DECLINING';
}

export interface ComplianceOverview {
  standards: {
    babok: { score: number; trend: string; status: ComplianceStatus };
    pmbok: { score: number; trend: string; status: ComplianceStatus };
    dmbok: { score: number; trend: string; status: ComplianceStatus };
  };
  overall: {
    score: number;
    grade: string;
    certification: string;
  };
}

export interface DeviationSummaryStats {
  total: number;
  byCategory: Record<DeviationType, number>;
  bySeverity: Record<DeviationSeverity, number>;
  byStatus: Record<ApprovalStatus, number>;
  intelligent: {
    total: number;
    approved: number;
    pending: number;
    recommended: number;
  };
}

export interface RiskMetrics {
  overallRisk: RiskLevel;
  riskByCategory: Record<RiskType, RiskLevel>;
  topRisks: TopRisk[];
  mitigationProgress: number;
}

export interface TopRisk {
  riskId: string;
  description: string;
  severity: DeviationSeverity;
  probability: Probability;
  impact: Impact;
  mitigation: string;
  owner: string;
  dueDate: Date;
}

export interface ComplianceTrends {
  scores: TimeSeriesData[];
  deviations: TimeSeriesData[];
  risks: TimeSeriesData[];
  period: string;
}

export interface TimeSeriesData {
  date: Date;
  value: number;
  category?: string;
}

export interface ActionItem {
  actionId: string;
  type: 'COMPLIANCE' | 'DEVIATION' | 'RISK' | 'IMPROVEMENT';
  priority: Priority;
  description: string;
  owner: string;
  dueDate: Date;
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
  dependencies: string[];
}

export interface ActivityLog {
  timestamp: Date;
  actor: string;
  action: string;
  details: string;
  impact: string;
}

// ===== ADDITIONAL SUPPORTING INTERFACES =====

export interface ProjectMetadata {
  createdBy: string;
  createdDate: Date;
  lastModified: Date;
  version: string;
  tags: string[];
  customFields: Record<string, any>;
}

export interface RegulatoryRequirement {
  id: string;
  name: string;
  description: string;
  authority: string;
  category: string;
  mandatory: boolean;
}

export interface ProjectDocument {
  id: string;
  name: string;
  type: string;
  status: string;
  version: string;
  lastModified: Date;
}

export interface ProjectProcess {
  id: string;
  name: string;
  category: string;
  standard: string;
  implementation: string;
  maturity: MaturityLevel;
}

export interface ProjectDeliverable {
  id: string;
  name: string;
  type: string;
  status: string;
  quality: string;
  standards: string[];
}

export interface GovernanceStructure {
  model: string;
  decisionRights: string[];
  approvalLevels: string[];
  oversight: string[];
}

export type DataMaturityLevel = 'INITIAL' | 'BASIC' | 'INTERMEDIATE' | 'ADVANCED' | 'OPTIMIZED';

// ===== PLACEHOLDER TYPES FOR FUTURE EXPANSION =====

export interface CompetencyAssessment {
  competency: string;
  score: number;
  evidence: string[];
}

export interface TechniqueUsageAnalysis {
  technique: string;
  usage: string;
  effectiveness: number;
}

export interface PrincipleAlignment {
  principle: string;
  alignment: number;
  gaps: string[];
}

export interface LifecycleAssessment {
  phase: string;
  maturity: MaturityLevel;
  gaps: string[];
}

export interface ValueDeliveryAssessment {
  criteria: string;
  score: number;
  observations: string[];
}

export interface DataFunctionScore {
  score: number;
  maturity: DataMaturityLevel;
  gaps: string[];
}

export interface GovernanceFrameworkAssessment {
  framework: string;
  maturity: MaturityLevel;
  score: number;
}

export interface DeviationRiskAssessment {
  riskLevel: RiskLevel;
  factors: string[];
  mitigation: string[];
}

export interface ImpactAnalysis {
  scope: string;
  severity: DeviationSeverity;
  stakeholders: string[];
}

export interface DeviationRecommendation {
  type: string;
  priority: Priority;
  description: string;
}

export interface DeviationImpact {
  scope: string;
  severity: string;
  timeframe: string;
}

export interface StandardApproachDescription {
  approach: string;
  rationale: string;
  benefits: string[];
}

export interface ProjectApproachDescription {
  approach: string;
  rationale: string;
  benefits: string[];
}

export interface RiskMitigation {
  riskId: string;
  strategy: string;
  actions: string[];
}

export interface ConflictResolution {
  strategy: string;
  recommendation: string;
  rationale: string;
}

export interface CrossStandardImpact {
  affectedStandards: string[];
  severity: string;
  implications: string[];
}

export interface ContextualFactor {
  factor: string;
  impact: string;
  weight: number;
}

export interface TimelineAnalysis {
  phases: string[];
  milestones: Date[];
  dependencies: string[];
}

export interface KeyFinding {
  finding: string;
  impact: Impact;
  recommendation: string;
}

export interface CriticalDeviationSummary {
  deviation: string;
  impact: Impact;
  urgency: Priority;
}

export interface IntelligentDeviationSummary {
  deviation: string;
  benefit: string;
  recommendation: string;
}

export interface RiskProfile {
  overallRisk: RiskLevel;
  categories: Record<string, RiskLevel>;
  trends: string[];
}

export interface ExecutiveRecommendation {
  priority: Priority;
  action: string;
  timeline: string;
}

export interface NextStep {
  step: string;
  owner: string;
  timeline: string;
}

export interface ApprovalRequirement {
  item: string;
  approver: string;
  deadline: Date;
}
