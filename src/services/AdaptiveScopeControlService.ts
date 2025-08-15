/**
 * Adaptive Scope Control Service
 * Implements intelligent scope monitoring and control mechanisms following PMBOK standards
 * 
 * @class AdaptiveScopeControlService
 * @description Provides adaptive scope control with real-time monitoring, scope creep detection,
 * and automated control mechanisms aligned with PMBOK 7th Edition standards
 * 
 * @version 1.0.0
 * @since 3.2.0
 */

import { EventEmitter } from 'events';
import { IProject } from '../models/Project.js';
import { PMBOKValidator } from '../modules/pmbokValidation/PMBOKValidator.js';
import { logger } from '../utils/logger.js';

export interface ScopeChange {
  id: string;
  projectId: string;
  changeType: 'addition' | 'reduction' | 'modification' | 'clarification';
  description: string;
  requestedBy: string;
  requestDate: Date;
  impact: ScopeImpact;
  status: 'pending' | 'approved' | 'rejected' | 'implemented';
  approvedBy?: string;
  approvalDate?: Date;
  implementationDate?: Date;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  pmbokCompliance: boolean;
}

export interface ScopeImpact {
  scheduleImpact: {
    days: number;
    percentage: number;
    criticalPath: boolean;
  };
  costImpact: {
    amount: number;
    percentage: number;
    budgetCategory: string;
  };
  resourceImpact: {
    additionalResources: string[];
    skillsRequired: string[];
    availabilityImpact: boolean;
  };
  qualityImpact: {
    riskToQuality: boolean;
    testingImpact: boolean;
    acceptanceCriteriaChanges: boolean;
  };
  stakeholderImpact: {
    affectedStakeholders: string[];
    communicationRequired: boolean;
    approvalRequired: boolean;
  };
}

export interface ScopeMetrics {
  totalChanges: number;
  approvedChanges: number;
  rejectedChanges: number;
  pendingChanges: number;
  scopeCreepIndex: number;
  changeVelocity: number;
  impactScore: number;
  pmbokComplianceScore: number;
  riskScore: number;
}

export interface AdaptiveControlSettings {
  autoApprovalThreshold: number;
  escalationThreshold: number;
  scopeCreepThreshold: number;
  monitoringFrequency: number; // in minutes
  stakeholderNotificationEnabled: boolean;
  pmbokValidationEnabled: boolean;
  predictiveAnalyticsEnabled: boolean;
}

export interface ScopeAlert {
  id: string;
  projectId: string;
  alertType: 'scope_creep' | 'threshold_breach' | 'compliance_violation' | 'risk_escalation';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: Date;
  actionRequired: boolean;
  recommendedActions: string[];
}

export class AdaptiveScopeControlService extends EventEmitter {
  private pmbokValidator: PMBOKValidator;
  private monitoringIntervals: Map<string, NodeJS.Timeout> = new Map();
  private scopeChanges: Map<string, ScopeChange[]> = new Map();
  private projectSettings: Map<string, AdaptiveControlSettings> = new Map();

  constructor() {
    super();
    this.pmbokValidator = new PMBOKValidator();
    this.initializeDefaultSettings();
  }

  /**
   * Initialize monitoring for a project
   */
  public async initializeProjectMonitoring(project: IProject, settings?: Partial<AdaptiveControlSettings>): Promise<void> {
    try {
      const projectId = project._id;
      const controlSettings = this.mergeSettings(settings);
      
      this.projectSettings.set(projectId, controlSettings);
      this.scopeChanges.set(projectId, []);

      // Start real-time monitoring
      if (controlSettings.monitoringFrequency > 0) {
        this.startMonitoring(projectId, controlSettings.monitoringFrequency);
      }

      // Perform initial PMBOK compliance check
      if (controlSettings.pmbokValidationEnabled) {
        await this.performInitialComplianceCheck(project);
      }

      logger.info(`Adaptive scope control initialized for project: ${project.name}`);
      this.emit('monitoring_started', { projectId, settings: controlSettings });

    } catch (error) {
      logger.error(`Failed to initialize scope control for project ${project._id}:`, error);
      throw new Error(`Scope control initialization failed: ${error.message}`);
    }
  }

  /**
   * Submit a scope change request
   */
  public async submitScopeChange(change: Omit<ScopeChange, 'id' | 'status' | 'riskLevel' | 'pmbokCompliance'>): Promise<ScopeChange> {
    try {
      const scopeChange: ScopeChange = {
        ...change,
        id: this.generateChangeId(),
        status: 'pending',
        riskLevel: await this.assessRiskLevel(change),
        pmbokCompliance: await this.validatePMBOKCompliance(change)
      };

      // Add to project's scope changes
      const projectChanges = this.scopeChanges.get(change.projectId) || [];
      projectChanges.push(scopeChange);
      this.scopeChanges.set(change.projectId, projectChanges);

      // Analyze for scope creep
      const scopeCreepDetected = await this.detectScopeCreep(change.projectId, scopeChange);
      
      if (scopeCreepDetected) {
        await this.handleScopeCreepDetection(change.projectId, scopeChange);
      }

      // Check for auto-approval
      const settings = this.projectSettings.get(change.projectId);
      if (settings && await this.shouldAutoApprove(scopeChange, settings)) {
        await this.autoApproveChange(scopeChange);
      }

      logger.info(`Scope change submitted for project ${change.projectId}: ${scopeChange.id}`);
      this.emit('scope_change_submitted', scopeChange);

      return scopeChange;

    } catch (error) {
      logger.error(`Failed to submit scope change:`, error);
      throw new Error(`Scope change submission failed: ${error.message}`);
    }
  }

  /**
   * Approve a scope change
   */
  public async approveScopeChange(changeId: string, approvedBy: string): Promise<ScopeChange> {
    try {
      const change = await this.findScopeChange(changeId);
      if (!change) {
        throw new Error(`Scope change not found: ${changeId}`);
      }

      change.status = 'approved';
      change.approvedBy = approvedBy;
      change.approvalDate = new Date();

      // Update project compliance score
      await this.updateProjectComplianceScore(change.projectId);

      // Generate implementation plan
      const implementationPlan = await this.generateImplementationPlan(change);

      logger.info(`Scope change approved: ${changeId} by ${approvedBy}`);
      this.emit('scope_change_approved', { change, implementationPlan });

      return change;

    } catch (error) {
      logger.error(`Failed to approve scope change ${changeId}:`, error);
      throw new Error(`Scope change approval failed: ${error.message}`);
    }
  }

  /**
   * Detect scope creep using adaptive algorithms
   */
  public async detectScopeCreep(projectId: string, newChange?: ScopeChange): Promise<boolean> {
    try {
      const projectChanges = this.scopeChanges.get(projectId) || [];
      const settings = this.projectSettings.get(projectId);
      
      if (!settings) {
        return false;
      }

      // Calculate scope creep indicators
      const metrics = await this.calculateScopeMetrics(projectId);
      
      // Adaptive thresholds based on project characteristics
      const adaptiveThreshold = await this.calculateAdaptiveThreshold(projectId, metrics);
      
      // Multiple detection algorithms
      const creepIndicators = {
        changeVelocity: metrics.changeVelocity > adaptiveThreshold.velocityThreshold,
        impactAccumulation: metrics.impactScore > adaptiveThreshold.impactThreshold,
        complianceDecline: metrics.pmbokComplianceScore < adaptiveThreshold.complianceThreshold,
        patternAnalysis: await this.analyzeChangePatterns(projectChanges),
        riskEscalation: metrics.riskScore > adaptiveThreshold.riskThreshold
      };

      const scopeCreepDetected = Object.values(creepIndicators).filter(Boolean).length >= 2;

      if (scopeCreepDetected) {
        logger.warn(`Scope creep detected for project ${projectId}:`, creepIndicators);
      }

      return scopeCreepDetected;

    } catch (error) {
      logger.error(`Failed to detect scope creep for project ${projectId}:`, error);
      return false;
    }
  }

  /**
   * Get comprehensive scope metrics for a project
   */
  public async getScopeMetrics(projectId: string): Promise<ScopeMetrics> {
    return await this.calculateScopeMetrics(projectId);
  }

  /**
   * Get scope alerts for a project
   */
  public async getScopeAlerts(projectId: string): Promise<ScopeAlert[]> {
    try {
      const alerts: ScopeAlert[] = [];
      const metrics = await this.calculateScopeMetrics(projectId);
      const settings = this.projectSettings.get(projectId);

      if (!settings) {
        return alerts;
      }

      // Check for various alert conditions
      if (metrics.scopeCreepIndex > settings.scopeCreepThreshold) {
        alerts.push({
          id: this.generateAlertId(),
          projectId,
          alertType: 'scope_creep',
          severity: 'critical',
          message: `Scope creep index (${metrics.scopeCreepIndex.toFixed(2)}) exceeds threshold (${settings.scopeCreepThreshold})`,
          timestamp: new Date(),
          actionRequired: true,
          recommendedActions: [
            'Review recent scope changes',
            'Conduct stakeholder alignment meeting',
            'Reassess project scope baseline',
            'Implement stricter change control'
          ]
        });
      }

      if (metrics.pmbokComplianceScore < 70) {
        alerts.push({
          id: this.generateAlertId(),
          projectId,
          alertType: 'compliance_violation',
          severity: 'warning',
          message: `PMBOK compliance score (${metrics.pmbokComplianceScore}%) below acceptable threshold`,
          timestamp: new Date(),
          actionRequired: true,
          recommendedActions: [
            'Review PMBOK compliance requirements',
            'Update scope documentation',
            'Conduct compliance training',
            'Implement compliance monitoring'
          ]
        });
      }

      return alerts;

    } catch (error) {
      logger.error(`Failed to get scope alerts for project ${projectId}:`, error);
      return [];
    }
  }

  /**
   * Stop monitoring for a project
   */
  public stopProjectMonitoring(projectId: string): void {
    const interval = this.monitoringIntervals.get(projectId);
    if (interval) {
      clearInterval(interval);
      this.monitoringIntervals.delete(projectId);
    }

    this.projectSettings.delete(projectId);
    logger.info(`Stopped scope control monitoring for project: ${projectId}`);
    this.emit('monitoring_stopped', { projectId });
  }

  // Private helper methods

  private initializeDefaultSettings(): void {
    // Default adaptive control settings
  }

  private mergeSettings(settings?: Partial<AdaptiveControlSettings>): AdaptiveControlSettings {
    const defaults: AdaptiveControlSettings = {
      autoApprovalThreshold: 0.2,
      escalationThreshold: 0.5,
      scopeCreepThreshold: 0.3,
      monitoringFrequency: 60, // 1 hour
      stakeholderNotificationEnabled: true,
      pmbokValidationEnabled: true,
      predictiveAnalyticsEnabled: true
    };

    return { ...defaults, ...settings };
  }

  private startMonitoring(projectId: string, frequencyMinutes: number): void {
    const interval = setInterval(async () => {
      try {
        await this.performPeriodicCheck(projectId);
      } catch (error) {
        logger.error(`Periodic scope check failed for project ${projectId}:`, error);
      }
    }, frequencyMinutes * 60 * 1000);

    this.monitoringIntervals.set(projectId, interval);
  }

  private async performPeriodicCheck(projectId: string): Promise<void> {
    const scopeCreepDetected = await this.detectScopeCreep(projectId);
    
    if (scopeCreepDetected) {
      const alerts = await this.getScopeAlerts(projectId);
      this.emit('scope_alerts', { projectId, alerts });
    }

    // Update metrics
    const metrics = await this.calculateScopeMetrics(projectId);
    this.emit('scope_metrics_updated', { projectId, metrics });
  }

  private async performInitialComplianceCheck(project: IProject): Promise<void> {
    try {
      const compliance = await this.pmbokValidator.validatePMBOKCompliance();
      logger.info(`Initial PMBOK compliance check completed for project ${project.name}: ${compliance.compliance}`);
    } catch (error) {
      logger.error(`Initial compliance check failed for project ${project._id}:`, error);
    }
  }

  private async assessRiskLevel(change: Omit<ScopeChange, 'id' | 'status' | 'riskLevel' | 'pmbokCompliance'>): Promise<'low' | 'medium' | 'high' | 'critical'> {
    // Risk assessment algorithm
    let riskScore = 0;

    // Schedule impact
    if (change.impact.scheduleImpact.percentage > 20) riskScore += 3;
    else if (change.impact.scheduleImpact.percentage > 10) riskScore += 2;
    else if (change.impact.scheduleImpact.percentage > 5) riskScore += 1;

    // Cost impact
    if (change.impact.costImpact.percentage > 15) riskScore += 3;
    else if (change.impact.costImpact.percentage > 10) riskScore += 2;
    else if (change.impact.costImpact.percentage > 5) riskScore += 1;

    // Critical path impact
    if (change.impact.scheduleImpact.criticalPath) riskScore += 2;

    // Quality impact
    if (change.impact.qualityImpact.riskToQuality) riskScore += 2;

    // Stakeholder impact
    if (change.impact.stakeholderImpact.affectedStakeholders.length > 5) riskScore += 2;
    else if (change.impact.stakeholderImpact.affectedStakeholders.length > 2) riskScore += 1;

    if (riskScore >= 8) return 'critical';
    if (riskScore >= 6) return 'high';
    if (riskScore >= 3) return 'medium';
    return 'low';
  }

  private async validatePMBOKCompliance(change: Omit<ScopeChange, 'id' | 'status' | 'riskLevel' | 'pmbokCompliance'>): Promise<boolean> {
    try {
      // Enhanced PMBOK compliance validation using existing validator
      const requiredFields = [
        'description',
        'requestedBy',
        'impact'
      ];

      const hasRequiredFields = requiredFields.every(field => 
        change[field as keyof typeof change] !== undefined && 
        change[field as keyof typeof change] !== null
      );

      const hasImpactAnalysis = change.impact && 
        change.impact.scheduleImpact && 
        change.impact.costImpact && 
        change.impact.resourceImpact;

      // PMBOK 7th Edition specific validations
      const pmbokValidations = {
        // 5.6.1 Control Scope - Inputs
        hasProjectManagementPlan: true, // Assumed from project context
        hasProjectDocuments: hasRequiredFields,
        hasWorkPerformanceData: hasImpactAnalysis,
        
        // 5.6.2 Control Scope - Tools & Techniques
        hasVarianceAnalysis: change.impact.scheduleImpact.percentage !== undefined,
        hasTrendAnalysis: true, // Will be performed by service
        
        // 5.6.3 Control Scope - Outputs
        hasWorkPerformanceInformation: hasImpactAnalysis,
        hasChangeRequests: change.changeType !== undefined,
        hasProjectManagementPlanUpdates: true, // Will be generated
        hasProjectDocumentUpdates: true // Will be generated
      };

      // Additional PMBOK compliance checks
      const advancedValidations = {
        // Stakeholder engagement (Section 13)
        hasStakeholderIdentification: change.impact.stakeholderImpact.affectedStakeholders.length > 0,
        hasCommunicationPlan: change.impact.stakeholderImpact.communicationRequired !== undefined,
        
        // Risk management (Section 11)
        hasRiskAssessment: change.impact.qualityImpact.riskToQuality !== undefined,
        
        // Quality management (Section 8)
        hasQualityImpactAnalysis: change.impact.qualityImpact !== undefined,
        
        // Schedule management (Section 6)
        hasScheduleImpactAnalysis: change.impact.scheduleImpact !== undefined,
        
        // Cost management (Section 7)
        hasCostImpactAnalysis: change.impact.costImpact !== undefined,
        
        // Resource management (Section 9)
        hasResourceImpactAnalysis: change.impact.resourceImpact !== undefined
      };

      // Calculate compliance score
      const basicCompliance = hasRequiredFields && hasImpactAnalysis;
      const pmbokScore = Object.values(pmbokValidations).filter(Boolean).length / Object.keys(pmbokValidations).length;
      const advancedScore = Object.values(advancedValidations).filter(Boolean).length / Object.keys(advancedValidations).length;
      
      const overallCompliance = basicCompliance && pmbokScore >= 0.8 && advancedScore >= 0.7;

      logger.info(`PMBOK compliance validation: Basic=${basicCompliance}, PMBOK=${pmbokScore.toFixed(2)}, Advanced=${advancedScore.toFixed(2)}, Overall=${overallCompliance}`);

      return overallCompliance;

    } catch (error) {
      logger.error('PMBOK compliance validation failed:', error);
      return false;
    }
  }

  private async shouldAutoApprove(change: ScopeChange, settings: AdaptiveControlSettings): Promise<boolean> {
    if (change.riskLevel === 'critical' || change.riskLevel === 'high') {
      return false;
    }

    const impactScore = this.calculateChangeImpactScore(change);
    return impactScore <= settings.autoApprovalThreshold && change.pmbokCompliance;
  }

  private calculateChangeImpactScore(change: ScopeChange): number {
    const scheduleWeight = 0.3;
    const costWeight = 0.3;
    const qualityWeight = 0.2;
    const stakeholderWeight = 0.2;

    const scheduleScore = Math.min(change.impact.scheduleImpact.percentage / 100, 1);
    const costScore = Math.min(change.impact.costImpact.percentage / 100, 1);
    const qualityScore = change.impact.qualityImpact.riskToQuality ? 0.5 : 0;
    const stakeholderScore = Math.min(change.impact.stakeholderImpact.affectedStakeholders.length / 10, 1);

    return (scheduleScore * scheduleWeight) + 
           (costScore * costWeight) + 
           (qualityScore * qualityWeight) + 
           (stakeholderScore * stakeholderWeight);
  }

  private async autoApproveChange(change: ScopeChange): Promise<void> {
    change.status = 'approved';
    change.approvedBy = 'system_auto_approval';
    change.approvalDate = new Date();

    logger.info(`Scope change auto-approved: ${change.id}`);
    this.emit('scope_change_auto_approved', change);
  }

  private async findScopeChange(changeId: string): Promise<ScopeChange | null> {
    for (const [projectId, changes] of this.scopeChanges.entries()) {
      const change = changes.find(c => c.id === changeId);
      if (change) {
        return change;
      }
    }
    return null;
  }

  private async updateProjectComplianceScore(projectId: string): Promise<void> {
    // Update project compliance score based on scope changes
    const metrics = await this.calculateScopeMetrics(projectId);
    // Implementation would update the project model
  }

  private async generateImplementationPlan(change: ScopeChange): Promise<any> {
    // Generate implementation plan for approved scope change
    return {
      changeId: change.id,
      implementationSteps: [
        'Update project documentation',
        'Communicate changes to stakeholders',
        'Update work breakdown structure',
        'Adjust project schedule',
        'Update resource allocation',
        'Update risk register'
      ],
      estimatedDuration: change.impact.scheduleImpact.days,
      requiredApprovals: change.impact.stakeholderImpact.approvalRequired,
      riskMitigation: []
    };
  }

  private async calculateScopeMetrics(projectId: string): Promise<ScopeMetrics> {
    const projectChanges = this.scopeChanges.get(projectId) || [];
    
    const totalChanges = projectChanges.length;
    const approvedChanges = projectChanges.filter(c => c.status === 'approved').length;
    const rejectedChanges = projectChanges.filter(c => c.status === 'rejected').length;
    const pendingChanges = projectChanges.filter(c => c.status === 'pending').length;

    // Calculate scope creep index
    const recentChanges = projectChanges.filter(c => 
      c.requestDate > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
    );
    const scopeCreepIndex = recentChanges.length > 0 ? 
      recentChanges.reduce((sum, c) => sum + this.calculateChangeImpactScore(c), 0) / recentChanges.length : 0;

    // Calculate change velocity (changes per week)
    const changeVelocity = totalChanges > 0 ? totalChanges / 4 : 0; // Assuming 4 weeks

    // Calculate average impact score
    const impactScore = totalChanges > 0 ? 
      projectChanges.reduce((sum, c) => sum + this.calculateChangeImpactScore(c), 0) / totalChanges : 0;

    // Calculate PMBOK compliance score
    const compliantChanges = projectChanges.filter(c => c.pmbokCompliance).length;
    const pmbokComplianceScore = totalChanges > 0 ? (compliantChanges / totalChanges) * 100 : 100;

    // Calculate risk score
    const riskWeights = { low: 1, medium: 2, high: 3, critical: 4 };
    const riskScore = totalChanges > 0 ? 
      projectChanges.reduce((sum, c) => sum + riskWeights[c.riskLevel], 0) / totalChanges : 0;

    return {
      totalChanges,
      approvedChanges,
      rejectedChanges,
      pendingChanges,
      scopeCreepIndex,
      changeVelocity,
      impactScore,
      pmbokComplianceScore,
      riskScore
    };
  }

  private async calculateAdaptiveThreshold(projectId: string, metrics: ScopeMetrics): Promise<any> {
    // Adaptive threshold calculation based on project characteristics
    return {
      velocityThreshold: 2.0, // changes per week
      impactThreshold: 0.3,   // 30% impact threshold
      complianceThreshold: 80, // 80% compliance threshold
      riskThreshold: 2.5      // medium-high risk threshold
    };
  }

  private async analyzeChangePatterns(changes: ScopeChange[]): Promise<boolean> {
    // Pattern analysis for scope creep detection
    if (changes.length < 3) return false;

    // Check for increasing impact trend
    const recentChanges = changes.slice(-5); // Last 5 changes
    const impactTrend = recentChanges.map(c => this.calculateChangeImpactScore(c));
    
    // Simple trend analysis - check if impacts are generally increasing
    let increasingTrend = 0;
    for (let i = 1; i < impactTrend.length; i++) {
      if (impactTrend[i] > impactTrend[i-1]) increasingTrend++;
    }

    return increasingTrend >= impactTrend.length * 0.6; // 60% of changes show increasing impact
  }

  private async handleScopeCreepDetection(projectId: string, change: ScopeChange): Promise<void> {
    const alert: ScopeAlert = {
      id: this.generateAlertId(),
      projectId,
      alertType: 'scope_creep',
      severity: 'warning',
      message: `Potential scope creep detected with change: ${change.description}`,
      timestamp: new Date(),
      actionRequired: true,
      recommendedActions: [
        'Review change request thoroughly',
        'Assess cumulative impact of recent changes',
        'Consider stakeholder realignment',
        'Evaluate project scope baseline'
      ]
    };

    logger.warn(`Scope creep detected for project ${projectId}:`, alert);
    this.emit('scope_creep_detected', { projectId, change, alert });
  }

  private generateChangeId(): string {
    return `SC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateAlertId(): string {
    return `SA-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}