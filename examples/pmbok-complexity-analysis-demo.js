#!/usr/bin/env node

/**
 * PMBOK Complexity Analysis Demo
 * 
 * Demonstrates Menno's hierarchical influence model for PMBOK documentation
 * Shows how primary knowledge area complexity drives secondary documentation requirements
 */

import { ComplexityDrivenDocumentationSystem } from '../src/modules/pmbok/ComplexityDrivenDocumentationSystem.js';
import { ScoringRubricSystem } from '../src/modules/pmbok/ScoringRubricSystem.js';

async function runPMBOKComplexityDemo() {
    console.log('🏗️  PMBOK Complexity-Driven Documentation Analysis');
    console.log('==================================================\n');
    
    try {
        const complexitySystem = ComplexityDrivenDocumentationSystem.getInstance();
        const rubricSystem = ScoringRubricSystem.getInstance();
        
        // Demo 1: Simple Project Analysis
        console.log('📊 Demo 1: Simple Project Analysis');
        console.log('----------------------------------');
        
        const simpleProject = {
            projectId: 'simple_001',
            projectName: 'Simple Internal Tool',
            teamSize: 3,
            skillRequirements: ['developer', 'designer'],
            resourceConstraints: [],
            locations: ['office'],
            externalDependencies: [],
            budget: 25000,
            fundingSources: ['department'],
            costConstraints: 'low',
            reportingRequirements: 'basic',
            regulatoryRequirements: [],
            qualityStandards: [],
            precisionRequirements: 'low',
            testingRequirements: 'basic',
            qaRequirements: 'basic',
            deliverables: ['tool', 'documentation'],
            scopeDefinition: 'very-clear',
            inclusionCriteria: ['core features'],
            exclusionCriteria: ['advanced features'],
            scopeBoundaries: 'very-clear',
            changeManagementRequirements: 'low'
        };
        
        const simpleAnalysis = await complexitySystem.analyzeProjectComplexity(simpleProject);
        
        console.log(`✅ Simple Project Analysis:`);
        console.log(`   Overall Complexity: ${simpleAnalysis.overallComplexity.toFixed(2)}/5`);
        console.log(`   Primary Areas:`);
        Object.entries(simpleAnalysis.primaryAreas).forEach(([area, complexity]) => {
            console.log(`     - ${area}: ${complexity.complexityScore.toFixed(1)}/5 ${complexity.documentationRequired ? '📋' : '❌'}`);
        });
        console.log(`   Documentation Recommendations: ${simpleAnalysis.documentationRecommendations.length}`);
        console.log(`   Critical/High Priority: ${simpleAnalysis.documentationRecommendations.filter(d => d.priority === 'critical' || d.priority === 'high').length}`);
        console.log('');
        
        // Demo 2: Complex Project Analysis
        console.log('📊 Demo 2: Complex Enterprise Project Analysis');
        console.log('------------------------------------------------');
        
        const complexProject = {
            projectId: 'complex_001',
            projectName: 'Enterprise Digital Transformation',
            teamSize: 45,
            skillRequirements: [
                'software-architect', 'senior-developer', 'junior-developer', 'devops-engineer',
                'qa-engineer', 'business-analyst', 'project-manager', 'scrum-master',
                'ui-ux-designer', 'data-analyst', 'security-specialist', 'integration-specialist'
            ],
            resourceConstraints: ['budget-limited', 'timeline-tight', 'skill-shortage'],
            locations: ['New York', 'London', 'Singapore', 'Sydney'],
            externalDependencies: ['vendor-a', 'vendor-b', 'consulting-firm', 'cloud-provider'],
            budget: 5000000,
            fundingSources: ['IT-budget', 'business-unit-a', 'business-unit-b', 'external-funding'],
            costConstraints: 'high',
            reportingRequirements: 'detailed',
            regulatoryRequirements: ['GDPR', 'SOX', 'ISO27001'],
            qualityStandards: ['ISO9001', 'CMMI-Level-3'],
            precisionRequirements: 'very-high',
            testingRequirements: 'extensive',
            qaRequirements: 'extensive',
            deliverables: [
                'new-platform', 'migration-tools', 'training-materials', 'documentation',
                'integration-apis', 'monitoring-dashboard', 'security-framework', 'compliance-report'
            ],
            scopeDefinition: 'moderate',
            inclusionCriteria: ['platform-migration', 'data-integration', 'user-training', 'compliance'],
            exclusionCriteria: ['legacy-systems', 'custom-development', 'third-party-integrations'],
            scopeBoundaries: 'moderate',
            changeManagementRequirements: 'high',
            timeConstraints: 'tight',
            stakeholders: ['executives', 'business-users', 'IT-team', 'vendors', 'compliance-team'],
            vendors: ['cloud-provider', 'consulting-firm', 'security-vendor'],
            stakeholderTypes: ['internal', 'external', 'regulatory', 'vendor']
        };
        
        const complexAnalysis = await complexitySystem.analyzeProjectComplexity(complexProject);
        
        console.log(`✅ Complex Project Analysis:`);
        console.log(`   Overall Complexity: ${complexAnalysis.overallComplexity.toFixed(2)}/5`);
        console.log(`   Primary Areas:`);
        Object.entries(complexAnalysis.primaryAreas).forEach(([area, complexity]) => {
            console.log(`     - ${area}: ${complexity.complexityScore.toFixed(1)}/5 ${complexity.documentationRequired ? '📋' : '❌'}`);
            if (complexity.secondaryTriggers.length > 0) {
                console.log(`       Triggers: ${complexity.secondaryTriggers.join(', ')}`);
            }
        });
        console.log(`   Secondary Areas:`);
        Object.entries(complexAnalysis.secondaryAreas).forEach(([area, complexity]) => {
            console.log(`     - ${area}: ${complexity.complexityScore.toFixed(1)}/5 ${complexity.documentationRequired ? '📋' : '❌'}`);
        });
        console.log(`   Documentation Recommendations: ${complexAnalysis.documentationRecommendations.length}`);
        console.log(`   Critical Priority: ${complexAnalysis.documentationRecommendations.filter(d => d.priority === 'critical').length}`);
        console.log(`   High Priority: ${complexAnalysis.documentationRecommendations.filter(d => d.priority === 'high').length}`);
        console.log('');
        
        // Demo 3: Scoring Rubric Demonstration
        console.log('📊 Demo 3: Detailed Scoring Rubric Analysis');
        console.log('--------------------------------------------');
        
        // Get Resources rubric
        const resourcesRubric = rubricSystem.getRubric('resources');
        if (resourcesRubric) {
            console.log(`✅ Resources Rubric Analysis:`);
            console.log(`   Factors: ${resourcesRubric.factors.length}`);
            resourcesRubric.factors.forEach(factor => {
                console.log(`     - ${factor.name} (weight: ${factor.weight * 100}%)`);
                console.log(`       Description: ${factor.description}`);
                console.log(`       Criteria levels: ${factor.criteria.length}`);
            });
            console.log('');
        }
        
        // Demo 4: Complexity Comparison
        console.log('📊 Demo 4: Project Complexity Comparison');
        console.log('----------------------------------------');
        
        const comparison = {
            simple: {
                name: 'Simple Project',
                complexity: simpleAnalysis.overallComplexity,
                documentation: simpleAnalysis.documentationRecommendations.length,
                primaryAreas: Object.values(simpleAnalysis.primaryAreas).filter(a => a.documentationRequired).length,
                secondaryAreas: Object.values(simpleAnalysis.secondaryAreas).filter(a => a.documentationRequired).length
            },
            complex: {
                name: 'Complex Project',
                complexity: complexAnalysis.overallComplexity,
                documentation: complexAnalysis.documentationRecommendations.length,
                primaryAreas: Object.values(complexAnalysis.primaryAreas).filter(a => a.documentationRequired).length,
                secondaryAreas: Object.values(complexAnalysis.secondaryAreas).filter(a => a.documentationRequired).length
            }
        };
        
        console.log(`✅ Complexity Comparison:`);
        console.log(`   Project Type        | Complexity | Documents | Primary | Secondary`);
        console.log(`   --------------------|------------|-----------|---------|----------`);
        console.log(`   ${comparison.simple.name.padEnd(20)} | ${comparison.simple.complexity.toFixed(1).padStart(10)} | ${comparison.simple.documentation.toString().padStart(9)} | ${comparison.simple.primaryAreas.toString().padStart(7)} | ${comparison.simple.secondaryAreas.toString().padStart(9)}`);
        console.log(`   ${comparison.complex.name.padEnd(20)} | ${comparison.complex.complexity.toFixed(1).padStart(10)} | ${comparison.complex.documentation.toString().padStart(9)} | ${comparison.complex.primaryAreas.toString().padStart(7)} | ${comparison.complex.secondaryAreas.toString().padStart(9)}`);
        console.log('');
        
        // Demo 5: Documentation Recommendations by Priority
        console.log('📊 Demo 5: Documentation Recommendations by Priority');
        console.log('----------------------------------------------------');
        
        const priorityGroups = {
            critical: complexAnalysis.documentationRecommendations.filter(d => d.priority === 'critical'),
            high: complexAnalysis.documentationRecommendations.filter(d => d.priority === 'high'),
            medium: complexAnalysis.documentationRecommendations.filter(d => d.priority === 'medium'),
            low: complexAnalysis.documentationRecommendations.filter(d => d.priority === 'low')
        };
        
        Object.entries(priorityGroups).forEach(([priority, docs]) => {
            if (docs.length > 0) {
                console.log(`✅ ${priority.toUpperCase()} Priority (${docs.length} documents):`);
                docs.forEach(doc => {
                    console.log(`     - ${doc.knowledgeArea}: ${doc.documentTypes.join(', ')}`);
                    console.log(`       Reason: ${doc.reason}`);
                    console.log(`       Trigger: ${doc.complexityTrigger}`);
                });
                console.log('');
            }
        });
        
        // Demo 6: Hierarchical Influence Demonstration
        console.log('📊 Demo 6: Hierarchical Influence Model Demonstration');
        console.log('-----------------------------------------------------');
        
        console.log(`✅ Menno's Hierarchical Influence Model in Action:`);
        console.log(`   Primary Drivers (Core Influencers):`);
        Object.entries(complexAnalysis.primaryAreas).forEach(([area, complexity]) => {
            console.log(`     🔹 ${area.toUpperCase()} (${complexity.complexityScore.toFixed(1)}/5):`);
            console.log(`       - Drives: ${complexity.secondaryTriggers.join(', ') || 'No secondary triggers'}`);
            console.log(`       - Documentation Required: ${complexity.documentationRequired ? 'Yes' : 'No'}`);
        });
        
        console.log(`   Secondary Areas (Responsive to Primary):`);
        Object.entries(complexAnalysis.secondaryAreas).forEach(([area, complexity]) => {
            console.log(`     🔸 ${area.toUpperCase()} (${complexity.complexityScore.toFixed(1)}/5):`);
            console.log(`       - Triggered by: Primary area complexity`);
            console.log(`       - Documentation Required: ${complexity.documentationRequired ? 'Yes' : 'No'}`);
        });
        console.log('');
        
        // Summary
        console.log('🎯 Demo Summary');
        console.log('===============');
        console.log('✅ Successfully demonstrated:');
        console.log('   - Primary knowledge area complexity scoring');
        console.log('   - Secondary area triggering based on primary complexity');
        console.log('   - Dynamic documentation recommendations');
        console.log('   - Hierarchical influence model implementation');
        console.log('   - Scoring rubric system architecture');
        console.log('');
        console.log('💡 Key Insights:');
        console.log(`   - Simple projects need ${comparison.simple.documentation} documents`);
        console.log(`   - Complex projects need ${comparison.complex.documentation} documents`);
        console.log(`   - Complexity ratio: ${(comparison.complex.complexity / comparison.simple.complexity).toFixed(1)}x`);
        console.log(`   - Documentation ratio: ${(comparison.complex.documentation / comparison.simple.documentation).toFixed(1)}x`);
        console.log('');
        console.log('🚀 The PMBOK Complexity-Driven Documentation System is ready for production!');
        
    } catch (error) {
        console.error('❌ Demo failed:', error.message);
        console.error('Stack trace:', error.stack);
        process.exit(1);
    }
}

// Run the demo if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runPMBOKComplexityDemo().catch(console.error);
}

export { runPMBOKComplexityDemo };
