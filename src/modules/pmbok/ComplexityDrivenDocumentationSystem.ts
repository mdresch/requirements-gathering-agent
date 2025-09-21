/**
 * PMBOK Complexity-Driven Documentation System
 * 
 * Implements Menno's hierarchical influence model where:
 * - Primary Knowledge Areas (Resources, Costs, Quality, Scope) drive complexity
 * - Secondary Knowledge Areas are triggered based on primary complexity scores
 * - Documentation requirements scale dynamically with project complexity
 */

export interface KnowledgeAreaComplexity {
    area: KnowledgeArea;
    complexityScore: number; // 1-5 scale
    factors: ComplexityFactor[];
    documentationRequired: boolean;
    secondaryTriggers: KnowledgeArea[];
}

export interface ComplexityFactor {
    name: string;
    weight: number;
    score: number;
    description: string;
}

export interface ProjectComplexityProfile {
    projectId: string;
    projectName: string;
    primaryAreas: {
        resources: KnowledgeAreaComplexity;
        costs: KnowledgeAreaComplexity;
        quality: KnowledgeAreaComplexity;
        scope: KnowledgeAreaComplexity;
    };
    secondaryAreas: {
        integration: KnowledgeAreaComplexity;
        schedule: KnowledgeAreaComplexity;
        communication: KnowledgeAreaComplexity;
        risk: KnowledgeAreaComplexity;
        procurement: KnowledgeAreaComplexity;
        stakeholder: KnowledgeAreaComplexity;
    };
    overallComplexity: number;
    documentationRecommendations: DocumentationRecommendation[];
}

export interface DocumentationRecommendation {
    knowledgeArea: KnowledgeArea;
    documentTypes: DocumentType[];
    priority: 'critical' | 'high' | 'medium' | 'low';
    reason: string;
    complexityTrigger: string;
}

export type KnowledgeArea = 
    | 'resources' | 'costs' | 'quality' | 'scope'
    | 'integration' | 'schedule' | 'communication' 
    | 'risk' | 'procurement' | 'stakeholder';

export type DocumentType = 
    | 'project-charter' | 'scope-statement' | 'wbs' | 'wbs-dictionary'
    | 'resource-management-plan' | 'cost-management-plan' | 'budget'
    | 'quality-management-plan' | 'quality-checklists' | 'quality-metrics'
    | 'schedule-management-plan' | 'project-schedule' | 'milestone-list'
    | 'communication-management-plan' | 'stakeholder-engagement-plan'
    | 'risk-management-plan' | 'risk-register' | 'procurement-management-plan'
    | 'integration-management-plan' | 'change-management-plan';

export class ComplexityDrivenDocumentationSystem {
    private static instance: ComplexityDrivenDocumentationSystem;
    
    // Primary knowledge area weights (Menno's core influencers)
    private readonly primaryWeights = {
        resources: 0.25,  // 25% - Drives Schedule, Communication, Procurement, Stakeholder
        costs: 0.20,      // 20% - Driven by Procurement + Human Resources
        quality: 0.15,    // 15% - Influences product standards and cost
        scope: 0.10       // 10% - Defines what's included/excluded
    };
    
    // Secondary knowledge area weights (responsive areas)
    private readonly secondaryWeights = {
        schedule: 0.08,       // 8% - Depends on resource availability
        communication: 0.07,  // 7% - Depends on team structure
        risk: 0.05,           // 5% - Emerges from scope, cost, resource decisions
        procurement: 0.05,    // 5% - Follows resource and cost planning
        stakeholder: 0.03,    // 3% - Influenced by scope and communication
        integration: 0.02     // 2% - Coordinates all elements
    };
    
    // Complexity thresholds for triggering secondary documentation
    private readonly complexityThresholds = {
        minimal: 2,      // 1-2: Minimal documentation
        moderate: 3,     // 3: Selective secondary documentation
        high: 4,         // 4-5: Full secondary documentation
        critical: 5      // 5: All documentation required
    };

    constructor() {
        if (ComplexityDrivenDocumentationSystem.instance) {
            return ComplexityDrivenDocumentationSystem.instance;
        }
        ComplexityDrivenDocumentationSystem.instance = this;
    }

    static getInstance(): ComplexityDrivenDocumentationSystem {
        if (!ComplexityDrivenDocumentationSystem.instance) {
            ComplexityDrivenDocumentationSystem.instance = new ComplexityDrivenDocumentationSystem();
        }
        return ComplexityDrivenDocumentationSystem.instance;
    }

    /**
     * Analyze project complexity and generate documentation recommendations
     */
    async analyzeProjectComplexity(projectData: any): Promise<ProjectComplexityProfile> {
        console.log('🔍 Analyzing project complexity for documentation requirements...');
        
        // Step 1: Score primary knowledge areas
        const primaryAreas = await this.scorePrimaryKnowledgeAreas(projectData);
        
        // Step 2: Calculate overall complexity
        const overallComplexity = this.calculateOverallComplexity(primaryAreas);
        
        // Step 3: Determine secondary area requirements
        const secondaryAreas = await this.determineSecondaryRequirements(primaryAreas, projectData);
        
        // Step 4: Generate documentation recommendations
        const documentationRecommendations = this.generateDocumentationRecommendations(
            primaryAreas, 
            secondaryAreas, 
            overallComplexity
        );
        
        const profile: ProjectComplexityProfile = {
            projectId: projectData.projectId || 'unknown',
            projectName: projectData.projectName || 'Unnamed Project',
            primaryAreas,
            secondaryAreas,
            overallComplexity,
            documentationRecommendations
        };
        
        console.log(`✅ Complexity analysis complete. Overall complexity: ${overallComplexity.toFixed(2)}/5`);
        console.log(`📋 Documentation recommendations: ${documentationRecommendations.length} documents suggested`);
        
        return profile;
    }

    /**
     * Score primary knowledge areas based on project characteristics
     */
    private async scorePrimaryKnowledgeAreas(projectData: any): Promise<{
        resources: KnowledgeAreaComplexity;
        costs: KnowledgeAreaComplexity;
        quality: KnowledgeAreaComplexity;
        scope: KnowledgeAreaComplexity;
    }> {
        console.log('📊 Scoring primary knowledge areas...');
        
        return {
            resources: await this.scoreResourcesComplexity(projectData),
            costs: await this.scoreCostsComplexity(projectData),
            quality: await this.scoreQualityComplexity(projectData),
            scope: await this.scoreScopeComplexity(projectData)
        };
    }

    /**
     * Score Resources complexity (Primary Driver)
     */
    private async scoreResourcesComplexity(projectData: any): Promise<KnowledgeAreaComplexity> {
        const factors: ComplexityFactor[] = [
            {
                name: 'Team Size',
                weight: 0.30,
                score: this.calculateTeamSizeScore(projectData.teamSize || 1),
                description: 'Number of team members involved'
            },
            {
                name: 'Skill Diversity',
                weight: 0.25,
                score: this.calculateSkillDiversityScore(projectData.skillRequirements || []),
                description: 'Variety of skills and expertise required'
            },
            {
                name: 'Resource Availability',
                weight: 0.20,
                score: this.calculateResourceAvailabilityScore(projectData.resourceConstraints),
                description: 'Availability and allocation of resources'
            },
            {
                name: 'Geographic Distribution',
                weight: 0.15,
                score: this.calculateGeographicDistributionScore(projectData.locations || []),
                description: 'Geographic spread of team members'
            },
            {
                name: 'External Dependencies',
                weight: 0.10,
                score: this.calculateExternalDependenciesScore(projectData.externalDependencies || []),
                description: 'Dependencies on external resources'
            }
        ];

        const complexityScore = this.calculateWeightedScore(factors);
        const secondaryTriggers = this.determineSecondaryTriggers('resources', complexityScore);

        return {
            area: 'resources',
            complexityScore,
            factors,
            documentationRequired: complexityScore >= this.complexityThresholds.minimal,
            secondaryTriggers
        };
    }

    /**
     * Score Costs complexity (Primary Driver)
     */
    private async scoreCostsComplexity(projectData: any): Promise<KnowledgeAreaComplexity> {
        const factors: ComplexityFactor[] = [
            {
                name: 'Budget Size',
                weight: 0.35,
                score: this.calculateBudgetSizeScore(projectData.budget),
                description: 'Total project budget amount'
            },
            {
                name: 'Funding Sources',
                weight: 0.25,
                score: this.calculateFundingSourcesScore(projectData.fundingSources || []),
                description: 'Number and complexity of funding sources'
            },
            {
                name: 'Cost Sensitivity',
                weight: 0.20,
                score: this.calculateCostSensitivityScore(projectData.costConstraints),
                description: 'Level of cost control requirements'
            },
            {
                name: 'Financial Reporting',
                weight: 0.20,
                score: this.calculateFinancialReportingScore(projectData.reportingRequirements),
                description: 'Complexity of financial reporting requirements'
            }
        ];

        const complexityScore = this.calculateWeightedScore(factors);
        const secondaryTriggers = this.determineSecondaryTriggers('costs', complexityScore);

        return {
            area: 'costs',
            complexityScore,
            factors,
            documentationRequired: complexityScore >= this.complexityThresholds.minimal,
            secondaryTriggers
        };
    }

    /**
     * Score Quality complexity (Primary Driver)
     */
    private async scoreQualityComplexity(projectData: any): Promise<KnowledgeAreaComplexity> {
        const factors: ComplexityFactor[] = [
            {
                name: 'Regulatory Requirements',
                weight: 0.30,
                score: this.calculateRegulatoryRequirementsScore(projectData.regulatoryRequirements || []),
                description: 'Level of regulatory compliance required'
            },
            {
                name: 'Quality Standards',
                weight: 0.25,
                score: this.calculateQualityStandardsScore(projectData.qualityStandards || []),
                description: 'Industry or organizational quality standards'
            },
            {
                name: 'Precision Requirements',
                weight: 0.20,
                score: this.calculatePrecisionRequirementsScore(projectData.precisionRequirements),
                description: 'Level of precision and accuracy required'
            },
            {
                name: 'Testing Requirements',
                weight: 0.15,
                score: this.calculateTestingRequirementsScore(projectData.testingRequirements),
                description: 'Complexity of testing and validation'
            },
            {
                name: 'Quality Assurance',
                weight: 0.10,
                score: this.calculateQualityAssuranceScore(projectData.qaRequirements),
                description: 'Level of quality assurance processes'
            }
        ];

        const complexityScore = this.calculateWeightedScore(factors);
        const secondaryTriggers = this.determineSecondaryTriggers('quality', complexityScore);

        return {
            area: 'quality',
            complexityScore,
            factors,
            documentationRequired: complexityScore >= this.complexityThresholds.minimal,
            secondaryTriggers
        };
    }

    /**
     * Score Scope complexity (Primary Driver)
     */
    private async scoreScopeComplexity(projectData: any): Promise<KnowledgeAreaComplexity> {
        const factors: ComplexityFactor[] = [
            {
                name: 'Deliverable Count',
                weight: 0.30,
                score: this.calculateDeliverableCountScore(projectData.deliverables || []),
                description: 'Number of project deliverables'
            },
            {
                name: 'Scope Clarity',
                weight: 0.25,
                score: this.calculateScopeClarityScore(projectData.scopeDefinition),
                description: 'Clarity and definition of project scope'
            },
            {
                name: 'Inclusion/Exclusion Criteria',
                weight: 0.20,
                score: this.calculateInclusionExclusionScore(projectData.inclusionCriteria, projectData.exclusionCriteria),
                description: 'Complexity of what is included/excluded'
            },
            {
                name: 'Scope Boundaries',
                weight: 0.15,
                score: this.calculateScopeBoundariesScore(projectData.scopeBoundaries),
                description: 'Clear definition of project boundaries'
            },
            {
                name: 'Change Management',
                weight: 0.10,
                score: this.calculateChangeManagementScore(projectData.changeManagementRequirements),
                description: 'Level of scope change management required'
            }
        ];

        const complexityScore = this.calculateWeightedScore(factors);
        const secondaryTriggers = this.determineSecondaryTriggers('scope', complexityScore);

        return {
            area: 'scope',
            complexityScore,
            factors,
            documentationRequired: complexityScore >= this.complexityThresholds.minimal,
            secondaryTriggers
        };
    }

    /**
     * Calculate overall project complexity based on primary areas
     */
    private calculateOverallComplexity(primaryAreas: any): number {
        let weightedSum = 0;
        let totalWeight = 0;

        Object.entries(primaryAreas).forEach(([area, complexity]: [string, any]) => {
            const weight = this.primaryWeights[area as keyof typeof this.primaryWeights] || 0;
            weightedSum += complexity.complexityScore * weight;
            totalWeight += weight;
        });

        return totalWeight > 0 ? weightedSum / totalWeight : 0;
    }

    /**
     * Determine secondary knowledge area requirements based on primary complexity
     */
    private async determineSecondaryRequirements(
        primaryAreas: any, 
        projectData: any
    ): Promise<{
        integration: KnowledgeAreaComplexity;
        schedule: KnowledgeAreaComplexity;
        communication: KnowledgeAreaComplexity;
        risk: KnowledgeAreaComplexity;
        procurement: KnowledgeAreaComplexity;
        stakeholder: KnowledgeAreaComplexity;
    }> {
        console.log('🔗 Determining secondary knowledge area requirements...');
        
        const secondaryAreas: any = {};
        
        // Integration Management - triggered by high complexity in any primary area
        secondaryAreas.integration = this.createSecondaryArea(
            'integration',
            this.calculateIntegrationComplexity(primaryAreas, projectData),
            ['All primary areas influence integration']
        );
        
        // Schedule Management - triggered by high resource complexity
        secondaryAreas.schedule = this.createSecondaryArea(
            'schedule',
            this.calculateScheduleComplexity(primaryAreas.resources, projectData),
            ['Resource complexity drives schedule management']
        );
        
        // Communication Management - triggered by high resource complexity
        secondaryAreas.communication = this.createSecondaryArea(
            'communication',
            this.calculateCommunicationComplexity(primaryAreas.resources, projectData),
            ['Resource complexity drives communication needs']
        );
        
        // Risk Management - triggered by high complexity in costs, quality, or scope
        secondaryAreas.risk = this.createSecondaryArea(
            'risk',
            this.calculateRiskComplexity(primaryAreas, projectData),
            ['Cost, quality, and scope complexity drive risk management']
        );
        
        // Procurement Management - triggered by high cost complexity
        secondaryAreas.procurement = this.createSecondaryArea(
            'procurement',
            this.calculateProcurementComplexity(primaryAreas.costs, projectData),
            ['Cost complexity drives procurement management']
        );
        
        // Stakeholder Management - triggered by high scope complexity
        secondaryAreas.stakeholder = this.createSecondaryArea(
            'stakeholder',
            this.calculateStakeholderComplexity(primaryAreas.scope, projectData),
            ['Scope complexity drives stakeholder management']
        );
        
        return secondaryAreas;
    }

    /**
     * Generate documentation recommendations based on complexity analysis
     */
    private generateDocumentationRecommendations(
        primaryAreas: any,
        secondaryAreas: any,
        overallComplexity: number
    ): DocumentationRecommendation[] {
        console.log('📋 Generating documentation recommendations...');
        
        const recommendations: DocumentationRecommendation[] = [];
        
        // Primary area documentation
        Object.values(primaryAreas).forEach((area: any) => {
            if (area.documentationRequired) {
                const docs = this.getDocumentsForKnowledgeArea(area.area, area.complexityScore);
                docs.forEach(doc => {
                    recommendations.push({
                        knowledgeArea: area.area,
                        documentTypes: [doc],
                        priority: this.determineDocumentPriority(area.complexityScore),
                        reason: `Required for ${area.area} management (complexity: ${area.complexityScore.toFixed(1)}/5)`,
                        complexityTrigger: `${area.area} complexity`
                    });
                });
            }
        });
        
        // Secondary area documentation (triggered by primary complexity)
        Object.values(secondaryAreas).forEach((area: any) => {
            if (area.documentationRequired) {
                const docs = this.getDocumentsForKnowledgeArea(area.area, area.complexityScore);
                docs.forEach(doc => {
                    recommendations.push({
                        knowledgeArea: area.area,
                        documentTypes: [doc],
                        priority: this.determineDocumentPriority(area.complexityScore),
                        reason: `Triggered by primary area complexity: ${area.secondaryTriggers.join(', ')}`,
                        complexityTrigger: area.secondaryTriggers.join(', ')
                    });
                });
            }
        });
        
        return recommendations.sort((a, b) => this.getPriorityWeight(b.priority) - this.getPriorityWeight(a.priority));
    }

    // Helper methods for scoring individual factors
    private calculateTeamSizeScore(teamSize: number): number {
        if (teamSize <= 3) return 1;
        if (teamSize <= 8) return 2;
        if (teamSize <= 15) return 3;
        if (teamSize <= 25) return 4;
        return 5;
    }

    private calculateSkillDiversityScore(skillRequirements: string[]): number {
        const uniqueSkills = new Set(skillRequirements).size;
        if (uniqueSkills <= 2) return 1;
        if (uniqueSkills <= 4) return 2;
        if (uniqueSkills <= 6) return 3;
        if (uniqueSkills <= 8) return 4;
        return 5;
    }

    private calculateResourceAvailabilityScore(constraints: any): number {
        if (!constraints || constraints.length === 0) return 1;
        if (constraints.length <= 2) return 2;
        if (constraints.length <= 4) return 3;
        if (constraints.length <= 6) return 4;
        return 5;
    }

    private calculateGeographicDistributionScore(locations: string[]): number {
        if (locations.length <= 1) return 1;
        if (locations.length <= 2) return 2;
        if (locations.length <= 3) return 3;
        if (locations.length <= 5) return 4;
        return 5;
    }

    private calculateExternalDependenciesScore(dependencies: string[]): number {
        if (dependencies.length === 0) return 1;
        if (dependencies.length <= 2) return 2;
        if (dependencies.length <= 4) return 3;
        if (dependencies.length <= 6) return 4;
        return 5;
    }

    private calculateBudgetSizeScore(budget: number): number {
        if (!budget) return 1;
        if (budget < 50000) return 1;
        if (budget < 250000) return 2;
        if (budget < 1000000) return 3;
        if (budget < 5000000) return 4;
        return 5;
    }

    private calculateFundingSourcesScore(fundingSources: string[]): number {
        if (fundingSources.length <= 1) return 1;
        if (fundingSources.length <= 2) return 2;
        if (fundingSources.length <= 3) return 3;
        if (fundingSources.length <= 4) return 4;
        return 5;
    }

    private calculateCostSensitivityScore(constraints: any): number {
        if (!constraints) return 1;
        if (constraints === 'low') return 2;
        if (constraints === 'medium') return 3;
        if (constraints === 'high') return 4;
        return 5;
    }

    private calculateFinancialReportingScore(requirements: any): number {
        if (!requirements) return 1;
        if (requirements === 'basic') return 2;
        if (requirements === 'standard') return 3;
        if (requirements === 'detailed') return 4;
        return 5;
    }

    private calculateRegulatoryRequirementsScore(requirements: string[]): number {
        if (requirements.length === 0) return 1;
        if (requirements.length <= 1) return 2;
        if (requirements.length <= 2) return 3;
        if (requirements.length <= 3) return 4;
        return 5;
    }

    private calculateQualityStandardsScore(standards: string[]): number {
        if (standards.length === 0) return 1;
        if (standards.length <= 1) return 2;
        if (standards.length <= 2) return 3;
        if (standards.length <= 3) return 4;
        return 5;
    }

    private calculatePrecisionRequirementsScore(requirements: any): number {
        if (!requirements || requirements === 'low') return 1;
        if (requirements === 'medium') return 2;
        if (requirements === 'high') return 3;
        if (requirements === 'very-high') return 4;
        return 5;
    }

    private calculateTestingRequirementsScore(requirements: any): number {
        if (!requirements || requirements === 'basic') return 1;
        if (requirements === 'standard') return 2;
        if (requirements === 'comprehensive') return 3;
        if (requirements === 'extensive') return 4;
        return 5;
    }

    private calculateQualityAssuranceScore(requirements: any): number {
        if (!requirements || requirements === 'basic') return 1;
        if (requirements === 'standard') return 2;
        if (requirements === 'comprehensive') return 3;
        if (requirements === 'extensive') return 4;
        return 5;
    }

    private calculateDeliverableCountScore(deliverables: string[]): number {
        if (deliverables.length <= 2) return 1;
        if (deliverables.length <= 4) return 2;
        if (deliverables.length <= 6) return 3;
        if (deliverables.length <= 8) return 4;
        return 5;
    }

    private calculateScopeClarityScore(definition: any): number {
        if (!definition || definition === 'very-clear') return 1;
        if (definition === 'clear') return 2;
        if (definition === 'moderate') return 3;
        if (definition === 'unclear') return 4;
        return 5;
    }

    private calculateInclusionExclusionScore(inclusion: any, exclusion: any): number {
        const totalCriteria = (inclusion?.length || 0) + (exclusion?.length || 0);
        if (totalCriteria <= 2) return 1;
        if (totalCriteria <= 4) return 2;
        if (totalCriteria <= 6) return 3;
        if (totalCriteria <= 8) return 4;
        return 5;
    }

    private calculateScopeBoundariesScore(boundaries: any): number {
        if (!boundaries || boundaries === 'very-clear') return 1;
        if (boundaries === 'clear') return 2;
        if (boundaries === 'moderate') return 3;
        if (boundaries === 'unclear') return 4;
        return 5;
    }

    private calculateChangeManagementScore(requirements: any): number {
        if (!requirements || requirements === 'low') return 1;
        if (requirements === 'medium') return 2;
        if (requirements === 'high') return 3;
        if (requirements === 'very-high') return 4;
        return 5;
    }

    // Secondary area complexity calculations
    private calculateIntegrationComplexity(primaryAreas: any, projectData: any): number {
        const maxPrimaryComplexity = Math.max(
            primaryAreas.resources.complexityScore,
            primaryAreas.costs.complexityScore,
            primaryAreas.quality.complexityScore,
            primaryAreas.scope.complexityScore
        );
        return Math.min(5, maxPrimaryComplexity * 0.8);
    }

    private calculateScheduleComplexity(resourceComplexity: any, projectData: any): number {
        const baseScore = resourceComplexity.complexityScore * 0.9;
        const timeConstraints = projectData.timeConstraints || 'standard';
        const timeMultiplier = timeConstraints === 'critical' ? 1.2 : 
                             timeConstraints === 'tight' ? 1.1 : 1.0;
        return Math.min(5, baseScore * timeMultiplier);
    }

    private calculateCommunicationComplexity(resourceComplexity: any, projectData: any): number {
        const baseScore = resourceComplexity.complexityScore * 0.8;
        const stakeholderCount = projectData.stakeholders?.length || 1;
        const stakeholderMultiplier = stakeholderCount > 10 ? 1.3 : 
                                     stakeholderCount > 5 ? 1.1 : 1.0;
        return Math.min(5, baseScore * stakeholderMultiplier);
    }

    private calculateRiskComplexity(primaryAreas: any, projectData: any): number {
        const avgPrimaryComplexity = (
            primaryAreas.costs.complexityScore + 
            primaryAreas.quality.complexityScore + 
            primaryAreas.scope.complexityScore
        ) / 3;
        return Math.min(5, avgPrimaryComplexity * 0.9);
    }

    private calculateProcurementComplexity(costComplexity: any, projectData: any): number {
        const baseScore = costComplexity.complexityScore * 0.85;
        const vendorCount = projectData.vendors?.length || 0;
        const vendorMultiplier = vendorCount > 5 ? 1.3 : 
                                vendorCount > 2 ? 1.1 : 1.0;
        return Math.min(5, baseScore * vendorMultiplier);
    }

    private calculateStakeholderComplexity(scopeComplexity: any, projectData: any): number {
        const baseScore = scopeComplexity.complexityScore * 0.8;
        const stakeholderDiversity = projectData.stakeholderTypes?.length || 1;
        const diversityMultiplier = stakeholderDiversity > 5 ? 1.2 : 
                                   stakeholderDiversity > 3 ? 1.1 : 1.0;
        return Math.min(5, baseScore * diversityMultiplier);
    }

    // Utility methods
    private calculateWeightedScore(factors: ComplexityFactor[]): number {
        let weightedSum = 0;
        let totalWeight = 0;
        
        factors.forEach(factor => {
            weightedSum += factor.score * factor.weight;
            totalWeight += factor.weight;
        });
        
        return totalWeight > 0 ? weightedSum / totalWeight : 0;
    }

    private determineSecondaryTriggers(primaryArea: string, complexityScore: number): KnowledgeArea[] {
        const triggers: KnowledgeArea[] = [];
        
        if (complexityScore >= this.complexityThresholds.high) {
            switch (primaryArea) {
                case 'resources':
                    triggers.push('schedule', 'communication', 'stakeholder');
                    break;
                case 'costs':
                    triggers.push('procurement', 'risk');
                    break;
                case 'quality':
                    triggers.push('integration', 'risk');
                    break;
                case 'scope':
                    triggers.push('integration', 'schedule', 'communication', 'risk', 'procurement', 'stakeholder');
                    break;
            }
        }
        
        return triggers;
    }

    private createSecondaryArea(area: KnowledgeArea, complexityScore: number, triggers: string[]): KnowledgeAreaComplexity {
        return {
            area,
            complexityScore,
            factors: [], // Secondary areas don't have detailed factors
            documentationRequired: complexityScore >= this.complexityThresholds.moderate,
            secondaryTriggers: triggers as KnowledgeArea[]
        };
    }

    private getDocumentsForKnowledgeArea(area: KnowledgeArea, complexityScore: number): DocumentType[] {
        const documentMap: Record<KnowledgeArea, DocumentType[]> = {
            resources: ['resource-management-plan'],
            costs: ['cost-management-plan', 'budget'],
            quality: ['quality-management-plan', 'quality-checklists', 'quality-metrics'],
            scope: ['scope-statement', 'wbs', 'wbs-dictionary'],
            integration: ['integration-management-plan', 'change-management-plan'],
            schedule: ['schedule-management-plan', 'project-schedule', 'milestone-list'],
            communication: ['communication-management-plan'],
            risk: ['risk-management-plan', 'risk-register'],
            procurement: ['procurement-management-plan'],
            stakeholder: ['stakeholder-engagement-plan']
        };
        
        return documentMap[area] || [];
    }

    private determineDocumentPriority(complexityScore: number): 'critical' | 'high' | 'medium' | 'low' {
        if (complexityScore >= 4.5) return 'critical';
        if (complexityScore >= 3.5) return 'high';
        if (complexityScore >= 2.5) return 'medium';
        return 'low';
    }

    private getPriorityWeight(priority: 'critical' | 'high' | 'medium' | 'low'): number {
        const weights = { critical: 4, high: 3, medium: 2, low: 1 };
        return weights[priority];
    }
}
