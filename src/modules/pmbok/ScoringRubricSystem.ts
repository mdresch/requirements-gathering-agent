/**
 * PMBOK Complexity Scoring Rubric System
 * 
 * Comprehensive scoring rubrics for primary knowledge area complexity assessment
 * Based on Menno's hierarchical influence model
 */

export interface ScoringCriteria {
    level: number; // 1-5 scale
    description: string;
    indicators: string[];
    examples: string[];
    documentationRequired: boolean;
    secondaryTriggers: KnowledgeArea[];
}

export interface KnowledgeAreaRubric {
    area: KnowledgeArea;
    factors: RubricFactor[];
    scoringMatrix: ScoringMatrix;
    thresholds: ComplexityThresholds;
}

export interface RubricFactor {
    name: string;
    weight: number;
    description: string;
    criteria: ScoringCriteria[];
}

export interface ScoringMatrix {
    [key: string]: {
        [level: number]: {
            score: number;
            weight: number;
            description: string;
        };
    };
}

export interface ComplexityThresholds {
    minimal: number;      // 1-2: Minimal documentation
    moderate: number;     // 3: Selective secondary documentation  
    high: number;         // 4-5: Full secondary documentation
    critical: number;     // 5: All documentation required
}

export type KnowledgeArea = 
    | 'resources' | 'costs' | 'quality' | 'scope'
    | 'integration' | 'schedule' | 'communication' 
    | 'risk' | 'procurement' | 'stakeholder';

export class ScoringRubricSystem {
    private static instance: ScoringRubricSystem;
    
    private readonly rubrics: Map<KnowledgeArea, KnowledgeAreaRubric> = new Map();

    constructor() {
        if (ScoringRubricSystem.instance) {
            return ScoringRubricSystem.instance;
        }
        this.initializeRubrics();
        ScoringRubricSystem.instance = this;
    }

    static getInstance(): ScoringRubricSystem {
        if (!ScoringRubricSystem.instance) {
            ScoringRubricSystem.instance = new ScoringRubricSystem();
        }
        return ScoringRubricSystem.instance;
    }

    /**
     * Get scoring rubric for a specific knowledge area
     */
    getRubric(area: KnowledgeArea): KnowledgeAreaRubric | undefined {
        return this.rubrics.get(area);
    }

    /**
     * Score a knowledge area using its rubric
     */
    scoreKnowledgeArea(area: KnowledgeArea, projectData: any): {
        area: KnowledgeArea;
        overallScore: number;
        factorScores: Array<{ factor: string; score: number; weight: number }>;
        complexityLevel: string;
        documentationRequired: boolean;
        secondaryTriggers: KnowledgeArea[];
        reasoning: string;
    } {
        const rubric = this.rubrics.get(area);
        if (!rubric) {
            throw new Error(`No rubric found for knowledge area: ${area}`);
        }

        const factorScores: Array<{ factor: string; score: number; weight: number }> = [];
        let weightedSum = 0;
        let totalWeight = 0;

        // Score each factor
        rubric.factors.forEach(factor => {
            const score = this.scoreFactor(factor, projectData);
            factorScores.push({
                factor: factor.name,
                score: score.level,
                weight: factor.weight
            });
            
            weightedSum += score.level * factor.weight;
            totalWeight += factor.weight;
        });

        const overallScore = totalWeight > 0 ? weightedSum / totalWeight : 0;
        const complexityLevel = this.determineComplexityLevel(overallScore, rubric.thresholds);
        const documentationRequired = overallScore >= rubric.thresholds.moderate;
        const secondaryTriggers = this.getSecondaryTriggers(area, overallScore, rubric.thresholds);
        const reasoning = this.generateReasoning(area, factorScores, overallScore, complexityLevel);

        return {
            area,
            overallScore,
            factorScores,
            complexityLevel,
            documentationRequired,
            secondaryTriggers,
            reasoning
        };
    }

    private initializeRubrics(): void {
        // Initialize Resources Rubric
        this.rubrics.set('resources', this.createResourcesRubric());
        
        // Initialize Costs Rubric  
        this.rubrics.set('costs', this.createCostsRubric());
        
        // Initialize Quality Rubric
        this.rubrics.set('quality', this.createQualityRubric());
        
        // Initialize Scope Rubric
        this.rubrics.set('scope', this.createScopeRubric());
    }

    private createResourcesRubric(): KnowledgeAreaRubric {
        return {
            area: 'resources',
            factors: [
                {
                    name: 'Team Size',
                    weight: 0.30,
                    description: 'Number of team members and organizational structure',
                    criteria: [
                        {
                            level: 1,
                            description: 'Small team (1-3 people)',
                            indicators: ['Single person', '2-3 team members', 'Simple structure'],
                            examples: ['Solo project', 'Small startup team', 'Basic project team'],
                            documentationRequired: false,
                            secondaryTriggers: []
                        },
                        {
                            level: 2,
                            description: 'Small-medium team (4-8 people)',
                            indicators: ['4-8 team members', 'Basic roles', 'Simple hierarchy'],
                            examples: ['Small development team', 'Basic project team', 'Department team'],
                            documentationRequired: false,
                            secondaryTriggers: []
                        },
                        {
                            level: 3,
                            description: 'Medium team (9-15 people)',
                            indicators: ['9-15 team members', 'Multiple roles', 'Clear hierarchy'],
                            examples: ['Development team + QA', 'Cross-functional team', 'Project team + support'],
                            documentationRequired: true,
                            secondaryTriggers: ['schedule', 'communication']
                        },
                        {
                            level: 4,
                            description: 'Large team (16-25 people)',
                            indicators: ['16-25 team members', 'Multiple departments', 'Complex hierarchy'],
                            examples: ['Multi-department project', 'Large development team', 'Enterprise project team'],
                            documentationRequired: true,
                            secondaryTriggers: ['schedule', 'communication', 'stakeholder']
                        },
                        {
                            level: 5,
                            description: 'Very large team (25+ people)',
                            indicators: ['25+ team members', 'Multiple organizations', 'Very complex hierarchy'],
                            examples: ['Enterprise-wide project', 'Multi-company project', 'Large program'],
                            documentationRequired: true,
                            secondaryTriggers: ['schedule', 'communication', 'stakeholder', 'integration']
                        }
                    ]
                },
                {
                    name: 'Skill Diversity',
                    weight: 0.25,
                    description: 'Variety of skills and expertise required',
                    criteria: [
                        {
                            level: 1,
                            description: 'Single skill set',
                            indicators: ['One primary skill', 'Homogeneous team', 'Simple requirements'],
                            examples: ['All developers', 'All analysts', 'Single discipline'],
                            documentationRequired: false,
                            secondaryTriggers: []
                        },
                        {
                            level: 2,
                            description: 'Limited skill diversity',
                            indicators: ['2-3 skill areas', 'Related disciplines', 'Basic coordination'],
                            examples: ['Dev + QA', 'Analyst + Developer', 'Design + Development'],
                            documentationRequired: false,
                            secondaryTriggers: []
                        },
                        {
                            level: 3,
                            description: 'Moderate skill diversity',
                            indicators: ['4-6 skill areas', 'Cross-functional', 'Moderate coordination'],
                            examples: ['Dev + QA + DevOps', 'Business + Technical', 'Multiple domains'],
                            documentationRequired: true,
                            secondaryTriggers: ['communication']
                        },
                        {
                            level: 4,
                            description: 'High skill diversity',
                            indicators: ['7-10 skill areas', 'Multi-disciplinary', 'Complex coordination'],
                            examples: ['Full stack team', 'Multi-domain experts', 'Cross-industry skills'],
                            documentationRequired: true,
                            secondaryTriggers: ['communication', 'integration']
                        },
                        {
                            level: 5,
                            description: 'Very high skill diversity',
                            indicators: ['10+ skill areas', 'Highly specialized', 'Very complex coordination'],
                            examples: ['Research project', 'Innovation project', 'Multi-industry expertise'],
                            documentationRequired: true,
                            secondaryTriggers: ['communication', 'integration', 'stakeholder']
                        }
                    ]
                },
                {
                    name: 'Resource Availability',
                    weight: 0.20,
                    description: 'Availability and allocation constraints',
                    criteria: [
                        {
                            level: 1,
                            description: 'High availability',
                            indicators: ['Dedicated resources', 'No constraints', 'Flexible allocation'],
                            examples: ['Full-time team', 'Dedicated budget', 'No competing priorities'],
                            documentationRequired: false,
                            secondaryTriggers: []
                        },
                        {
                            level: 2,
                            description: 'Good availability',
                            indicators: ['Mostly dedicated', 'Minor constraints', 'Some flexibility'],
                            examples: ['80%+ allocation', 'Minor competing work', 'Some flexibility'],
                            documentationRequired: false,
                            secondaryTriggers: []
                        },
                        {
                            level: 3,
                            description: 'Moderate availability',
                            indicators: ['Part-time allocation', 'Some constraints', 'Limited flexibility'],
                            examples: ['50-80% allocation', 'Some competing work', 'Limited flexibility'],
                            documentationRequired: true,
                            secondaryTriggers: ['schedule']
                        },
                        {
                            level: 4,
                            description: 'Low availability',
                            indicators: ['Heavily constrained', 'Multiple competing priorities', 'Very limited flexibility'],
                            examples: ['<50% allocation', 'Multiple projects', 'Tight constraints'],
                            documentationRequired: true,
                            secondaryTriggers: ['schedule', 'risk']
                        },
                        {
                            level: 5,
                            description: 'Very low availability',
                            indicators: ['Extremely constrained', 'Many competing priorities', 'No flexibility'],
                            examples: ['<25% allocation', 'Many projects', 'Critical constraints'],
                            documentationRequired: true,
                            secondaryTriggers: ['schedule', 'risk', 'integration']
                        }
                    ]
                },
                {
                    name: 'Geographic Distribution',
                    weight: 0.15,
                    description: 'Geographic spread of team members',
                    criteria: [
                        {
                            level: 1,
                            description: 'Co-located',
                            indicators: ['Single location', 'Same building', 'Easy communication'],
                            examples: ['Same office', 'Same floor', 'Face-to-face meetings'],
                            documentationRequired: false,
                            secondaryTriggers: []
                        },
                        {
                            level: 2,
                            description: 'Same city',
                            indicators: ['Same city', 'Multiple locations', 'Occasional travel'],
                            examples: ['Multiple offices in city', 'Some travel required', 'Regional team'],
                            documentationRequired: false,
                            secondaryTriggers: []
                        },
                        {
                            level: 3,
                            description: 'Regional distribution',
                            indicators: ['Multiple cities', 'Regular travel', 'Time zone differences'],
                            examples: ['Multi-city team', 'Regular travel', '2-3 time zones'],
                            documentationRequired: true,
                            secondaryTriggers: ['communication']
                        },
                        {
                            level: 4,
                            description: 'National distribution',
                            indicators: ['Multiple states/regions', 'Frequent travel', 'Multiple time zones'],
                            examples: ['National team', 'Frequent travel', '3-5 time zones'],
                            documentationRequired: true,
                            secondaryTriggers: ['communication', 'schedule']
                        },
                        {
                            level: 5,
                            description: 'Global distribution',
                            indicators: ['Multiple countries', 'Complex travel', 'Many time zones'],
                            examples: ['Global team', 'Complex travel', '5+ time zones'],
                            documentationRequired: true,
                            secondaryTriggers: ['communication', 'schedule', 'integration']
                        }
                    ]
                },
                {
                    name: 'External Dependencies',
                    weight: 0.10,
                    description: 'Dependencies on external resources',
                    criteria: [
                        {
                            level: 1,
                            description: 'No external dependencies',
                            indicators: ['Internal resources only', 'Self-contained', 'No external coordination'],
                            examples: ['Internal team only', 'No vendors', 'No external partners'],
                            documentationRequired: false,
                            secondaryTriggers: []
                        },
                        {
                            level: 2,
                            description: 'Minimal external dependencies',
                            indicators: ['1-2 external resources', 'Simple coordination', 'Clear interfaces'],
                            examples: ['Single vendor', 'One external partner', 'Simple outsourcing'],
                            documentationRequired: false,
                            secondaryTriggers: []
                        },
                        {
                            level: 3,
                            description: 'Moderate external dependencies',
                            indicators: ['3-5 external resources', 'Moderate coordination', 'Some complexity'],
                            examples: ['Multiple vendors', 'External partners', 'Mixed team'],
                            documentationRequired: true,
                            secondaryTriggers: ['procurement']
                        },
                        {
                            level: 4,
                            description: 'High external dependencies',
                            indicators: ['6-10 external resources', 'Complex coordination', 'High complexity'],
                            examples: ['Many vendors', 'Complex partnerships', 'Heavy outsourcing'],
                            documentationRequired: true,
                            secondaryTriggers: ['procurement', 'risk']
                        },
                        {
                            level: 5,
                            description: 'Very high external dependencies',
                            indicators: ['10+ external resources', 'Very complex coordination', 'Critical dependencies'],
                            examples: ['Many vendors', 'Complex ecosystem', 'Critical external dependencies'],
                            documentationRequired: true,
                            secondaryTriggers: ['procurement', 'risk', 'integration']
                        }
                    ]
                }
            ],
            scoringMatrix: {},
            thresholds: {
                minimal: 2,
                moderate: 3,
                high: 4,
                critical: 5
            }
        };
    }

    private createCostsRubric(): KnowledgeAreaRubric {
        return {
            area: 'costs',
            factors: [
                {
                    name: 'Budget Size',
                    weight: 0.35,
                    description: 'Total project budget amount',
                    criteria: [
                        {
                            level: 1,
                            description: 'Small budget (<$50K)',
                            indicators: ['Under $50K', 'Limited scope', 'Simple tracking'],
                            examples: ['Small internal project', 'Proof of concept', 'Basic implementation'],
                            documentationRequired: false,
                            secondaryTriggers: []
                        },
                        {
                            level: 2,
                            description: 'Medium budget ($50K-$250K)',
                            indicators: ['$50K-$250K', 'Moderate scope', 'Standard tracking'],
                            examples: ['Department project', 'Mid-size implementation', 'Standard project'],
                            documentationRequired: true,
                            secondaryTriggers: ['procurement']
                        },
                        {
                            level: 3,
                            description: 'Large budget ($250K-$1M)',
                            indicators: ['$250K-$1M', 'Significant scope', 'Detailed tracking'],
                            examples: ['Division project', 'Major implementation', 'Significant investment'],
                            documentationRequired: true,
                            secondaryTriggers: ['procurement', 'risk']
                        },
                        {
                            level: 4,
                            description: 'Very large budget ($1M-$5M)',
                            indicators: ['$1M-$5M', 'Major scope', 'Complex tracking'],
                            examples: ['Enterprise project', 'Major transformation', 'Strategic investment'],
                            documentationRequired: true,
                            secondaryTriggers: ['procurement', 'risk', 'integration']
                        },
                        {
                            level: 5,
                            description: 'Massive budget ($5M+)',
                            indicators: ['$5M+', 'Massive scope', 'Very complex tracking'],
                            examples: ['Organization-wide project', 'Major transformation', 'Strategic initiative'],
                            documentationRequired: true,
                            secondaryTriggers: ['procurement', 'risk', 'integration', 'stakeholder']
                        }
                    ]
                },
                {
                    name: 'Funding Sources',
                    weight: 0.25,
                    description: 'Number and complexity of funding sources',
                    criteria: [
                        {
                            level: 1,
                            description: 'Single funding source',
                            indicators: ['One budget', 'Simple approval', 'Clear ownership'],
                            examples: ['Department budget', 'Single sponsor', 'Internal funding'],
                            documentationRequired: false,
                            secondaryTriggers: []
                        },
                        {
                            level: 2,
                            description: 'Limited funding sources',
                            indicators: ['2-3 sources', 'Basic coordination', 'Clear allocation'],
                            examples: ['Two departments', 'Internal + external', 'Limited complexity'],
                            documentationRequired: true,
                            secondaryTriggers: ['procurement']
                        },
                        {
                            level: 3,
                            description: 'Moderate funding sources',
                            indicators: ['4-6 sources', 'Moderate coordination', 'Some complexity'],
                            examples: ['Multiple departments', 'Mixed funding', 'Moderate complexity'],
                            documentationRequired: true,
                            secondaryTriggers: ['procurement', 'risk']
                        },
                        {
                            level: 4,
                            description: 'Complex funding sources',
                            indicators: ['7-10 sources', 'Complex coordination', 'High complexity'],
                            examples: ['Many departments', 'Complex funding mix', 'High coordination'],
                            documentationRequired: true,
                            secondaryTriggers: ['procurement', 'risk', 'integration']
                        },
                        {
                            level: 5,
                            description: 'Very complex funding sources',
                            indicators: ['10+ sources', 'Very complex coordination', 'Critical complexity'],
                            examples: ['Many stakeholders', 'Complex funding', 'Critical coordination'],
                            documentationRequired: true,
                            secondaryTriggers: ['procurement', 'risk', 'integration', 'stakeholder']
                        }
                    ]
                },
                {
                    name: 'Cost Sensitivity',
                    weight: 0.20,
                    description: 'Level of cost control requirements',
                    criteria: [
                        {
                            level: 1,
                            description: 'Low cost sensitivity',
                            indicators: ['Flexible budget', 'Basic tracking', 'Minimal controls'],
                            examples: ['Research project', 'Exploratory work', 'Low risk'],
                            documentationRequired: false,
                            secondaryTriggers: []
                        },
                        {
                            level: 2,
                            description: 'Moderate cost sensitivity',
                            indicators: ['Some flexibility', 'Standard tracking', 'Basic controls'],
                            examples: ['Standard project', 'Normal controls', 'Moderate risk'],
                            documentationRequired: true,
                            secondaryTriggers: ['procurement']
                        },
                        {
                            level: 3,
                            description: 'High cost sensitivity',
                            indicators: ['Limited flexibility', 'Detailed tracking', 'Strict controls'],
                            examples: ['Budget constrained', 'Detailed tracking', 'High controls'],
                            documentationRequired: true,
                            secondaryTriggers: ['procurement', 'risk']
                        },
                        {
                            level: 4,
                            description: 'Very high cost sensitivity',
                            indicators: ['Very limited flexibility', 'Complex tracking', 'Very strict controls'],
                            examples: ['Tight budget', 'Complex tracking', 'Very strict controls'],
                            documentationRequired: true,
                            secondaryTriggers: ['procurement', 'risk', 'integration']
                        },
                        {
                            level: 5,
                            description: 'Critical cost sensitivity',
                            indicators: ['No flexibility', 'Critical tracking', 'Critical controls'],
                            examples: ['Fixed budget', 'Critical tracking', 'Critical controls'],
                            documentationRequired: true,
                            secondaryTriggers: ['procurement', 'risk', 'integration', 'stakeholder']
                        }
                    ]
                },
                {
                    name: 'Financial Reporting',
                    weight: 0.20,
                    description: 'Complexity of financial reporting requirements',
                    criteria: [
                        {
                            level: 1,
                            description: 'Basic reporting',
                            indicators: ['Simple reports', 'Basic tracking', 'Minimal requirements'],
                            examples: ['Monthly summary', 'Basic tracking', 'Internal only'],
                            documentationRequired: false,
                            secondaryTriggers: []
                        },
                        {
                            level: 2,
                            description: 'Standard reporting',
                            indicators: ['Regular reports', 'Standard tracking', 'Basic requirements'],
                            examples: ['Weekly updates', 'Standard tracking', 'Department level'],
                            documentationRequired: true,
                            secondaryTriggers: ['procurement']
                        },
                        {
                            level: 3,
                            description: 'Detailed reporting',
                            indicators: ['Detailed reports', 'Complex tracking', 'Moderate requirements'],
                            examples: ['Detailed reports', 'Complex tracking', 'Executive level'],
                            documentationRequired: true,
                            secondaryTriggers: ['procurement', 'risk']
                        },
                        {
                            level: 4,
                            description: 'Complex reporting',
                            indicators: ['Complex reports', 'Very detailed tracking', 'High requirements'],
                            examples: ['Complex reports', 'Detailed tracking', 'Board level'],
                            documentationRequired: true,
                            secondaryTriggers: ['procurement', 'risk', 'integration']
                        },
                        {
                            level: 5,
                            description: 'Critical reporting',
                            indicators: ['Critical reports', 'Critical tracking', 'Critical requirements'],
                            examples: ['Critical reports', 'Critical tracking', 'Regulatory level'],
                            documentationRequired: true,
                            secondaryTriggers: ['procurement', 'risk', 'integration', 'stakeholder']
                        }
                    ]
                }
            ],
            scoringMatrix: {},
            thresholds: {
                minimal: 2,
                moderate: 3,
                high: 4,
                critical: 5
            }
        };
    }

    // Additional rubric creation methods would follow similar patterns...
    private createQualityRubric(): KnowledgeAreaRubric {
        // Implementation similar to resources and costs
        return {
            area: 'quality',
            factors: [],
            scoringMatrix: {},
            thresholds: { minimal: 2, moderate: 3, high: 4, critical: 5 }
        };
    }

    private createScopeRubric(): KnowledgeAreaRubric {
        // Implementation similar to resources and costs  
        return {
            area: 'scope',
            factors: [],
            scoringMatrix: {},
            thresholds: { minimal: 2, moderate: 3, high: 4, critical: 5 }
        };
    }

    private scoreFactor(factor: RubricFactor, projectData: any): { level: number; criteria: ScoringCriteria } {
        // Implementation would analyze project data against factor criteria
        // and return the best matching level
        return { level: 3, criteria: factor.criteria[2] }; // Placeholder
    }

    private determineComplexityLevel(score: number, thresholds: ComplexityThresholds): string {
        if (score >= thresholds.critical) return 'Critical';
        if (score >= thresholds.high) return 'High';
        if (score >= thresholds.moderate) return 'Moderate';
        if (score >= thresholds.minimal) return 'Minimal';
        return 'Very Low';
    }

    private getSecondaryTriggers(area: KnowledgeArea, score: number, thresholds: ComplexityThresholds): KnowledgeArea[] {
        // Implementation would determine secondary triggers based on area and score
        return []; // Placeholder
    }

    private generateReasoning(area: KnowledgeArea, factorScores: any[], overallScore: number, complexityLevel: string): string {
        return `Based on ${area} analysis: ${complexityLevel} complexity (${overallScore.toFixed(1)}/5) driven by ${factorScores.map(f => f.factor).join(', ')}`;
    }
}
