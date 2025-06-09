#!/usr/bin/env node

/**
 * Comprehensive Integration Test for 12 New Document Types
 * Tests all newly implemented document types through DocumentGenerator
 * Validates PMBOK compliance and content quality
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';
import { readFile } from 'fs/promises';
import * as fs from 'fs/promises';
import * as path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables manually
try {
    const envContent = readFileSync(join(__dirname, '.env'), 'utf8');
    envContent.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            process.env[key.trim()] = value.trim();
        }
    });
} catch (error) {
    console.log('Warning: Could not load .env file, using existing environment variables');
}

// Import the compiled modules
import('./dist/modules/documentGenerator/DocumentGenerator.js').then(async (docGenModule) => {
    const { DocumentGenerator } = docGenModule;
    
    // Import helper functions
    const tasksModule = await import('./dist/modules/documentGenerator/generationTasks.js');
    const { DOCUMENT_CONFIG, getTaskByKey } = tasksModule;

    console.log('🚀 Starting Comprehensive Integration Test for 12 New Document Types\n');

    // Helper function to get category folder
    function getCategoryFolder(category) {
        const categoryMap = {
            'core-analysis': 'core-analysis',
            'management-plans': 'management-plans',
            'planning-artifacts': 'planning-artifacts',
            'project-charter': 'project-charter',
            'stakeholder-management': 'stakeholder-management',
            'strategic-statements': 'strategic-statements',
            'technical-analysis': 'technical-analysis'
        };
        return categoryMap[category] || 'unknown';
    }    // Define the 12 new document types to test (using correct kebab-case keys)
    const newDocumentTypes = [
        // ProjectManagementProcessor (2)
        'project-statement-of-work',        // was: projectStatementOfWork
        'business-case',                    // was: businessCase
        
        // PMBOKProcessProcessor (2) 
        'perform-integrated-change-control', // was: performIntegratedChangeControlProcess
        'close-project-or-phase',           // was: closeProjectOrPhaseProcess
        
        // ScopeManagementProcessor (3)
        'plan-scope-management',            // was: planScopeManagement
        'define-scope',                     // was: defineScopeProcess 
        'work-performance-information-scope', // was: workPerformanceInformationScope
        
        // RequirementsProcessor (2)
        'requirements-management-plan',     // was: requirementsManagementPlan
        'collect-requirements',             // was: collectRequirementsProcess
        
        // WBSProcessor (1)
        'create-wbs',                       // was: createWbsProcess
        
        // ActivityProcessor (2)
        'activity-duration-estimates',      // was: activityDurationEstimates
        'activity-resource-estimates'       // was: activityResourceEstimates
    ];    // Mock project context for testing (as string, not object)
    const mockProjectContext = `
Project: Enterprise Digital Transformation Initiative
Type: Digital transformation and modernization project
Description: A comprehensive digital transformation project to modernize legacy systems, implement cloud infrastructure, and enhance customer experience through digital channels.
Business Objectives:
- Reduce operational costs by 25%
- Improve customer satisfaction scores by 30%
- Increase digital channel adoption to 80%
- Enhance system reliability and performance
Technology Stack: Cloud computing, microservices, React, Node.js, Docker, Kubernetes
Stakeholders: Chief Digital Officer, IT Director, Customer Experience Manager, Operations Manager, Security Officer
Timeline: 18 months
Budget: $2.5M
Team: 8 developers, 3 DevOps engineers, 2 UX designers, 1 security specialist, 2 QA engineers
Risk Factors:
- Legacy system integration complexity
- Data migration challenges
- User adoption resistance
- Regulatory compliance requirements
Deliverables: Modernized application suite, cloud infrastructure, user training programs, documentation
Success Criteria: Successful migration of all legacy systems, improved performance metrics, user satisfaction scores
    `.trim();

    const testResults = {
        passed: 0,
        failed: 0,
        details: [],
        contentQuality: {},
        pmbokCompliance: {}
    };

    console.log(`Testing ${newDocumentTypes.length} new document types...\n`);

    // Test each document type individually
    for (const [index, docType] of newDocumentTypes.entries()) {
        console.log(`📝 [${index + 1}/${newDocumentTypes.length}] Testing: ${docType}`);
          try {
            const generator = new DocumentGenerator(mockProjectContext);
            
            // Test individual document generation
            const result = await generator.generateOne(docType);
            
            // Check if files were actually generated by looking at the file system
            const taskConfig = getTaskByKey(docType);
            const docConfig = DOCUMENT_CONFIG[docType];
            
            if (result && result.success && docConfig) {
                // Try to read the generated file to check actual content
                const filePath = path.join('generated-documents', getCategoryFolder(taskConfig?.category || 'unknown'), docConfig.filename);
                
                try {
                    const fileContent = await fs.readFile(filePath, 'utf8');
                    const contentLength = fileContent.length;
                    
                    // Check if the content is substantial (more than just headers and placeholders)
                    const hasSubstantialContent = contentLength > 1000 && 
                        !fileContent.includes('Please provide the Project Context') &&
                        !fileContent.includes('[object Object]');
                    
                    if (hasSubstantialContent) {
                        console.log(`   ✅ SUCCESS - Generated ${contentLength} characters`);
                        
                        testResults.passed++;
                        testResults.details.push({
                            docType,
                            status: 'PASS',
                            contentLength,
                            hasStructure: fileContent.includes('#') || fileContent.includes('##'),
                            hasPMBOKElements: fileContent.toLowerCase().includes('pmbok') || 
                                             fileContent.toLowerCase().includes('process') ||
                                             fileContent.toLowerCase().includes('deliverable')
                        });

                        // Analyze content quality
                        testResults.contentQuality[docType] = analyzeContentQuality(fileContent);
                        testResults.pmbokCompliance[docType] = analyzePMBOKCompliance(fileContent);
                    } else {
                        console.log(`   ⚠️  PLACEHOLDER CONTENT - ${contentLength} characters (contains placeholders)`);
                        testResults.failed++;
                        testResults.details.push({
                            docType,
                            status: 'PLACEHOLDER',
                            reason: 'Contains placeholder content',
                            contentLength
                        });
                    }
                } catch (fileError) {
                    console.log(`   ❌ FILE READ ERROR - ${fileError.message}`);
                    testResults.failed++;
                    testResults.details.push({
                        docType,
                        status: 'FILE_ERROR',
                        reason: fileError.message
                    });
                }
            } else {
                console.log(`   ❌ GENERATION FAILED - No success result`);
                testResults.failed++;
                testResults.details.push({
                    docType,
                    status: 'FAIL',
                    reason: 'Generation failed',
                    result: result ? JSON.stringify(result) : 'null'
                });
            }
            
        } catch (error) {
            console.log(`   ❌ ERROR - ${error.message}`);
            testResults.failed++;
            testResults.details.push({
                docType,
                status: 'ERROR',
                reason: error.message
            });
        }

        // Small delay to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Generate comprehensive test report
    console.log('\n' + '='.repeat(60));
    console.log('📊 COMPREHENSIVE TEST RESULTS SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Passed: ${testResults.passed}/${newDocumentTypes.length}`);
    console.log(`❌ Failed: ${testResults.failed}/${newDocumentTypes.length}`);
    console.log(`📈 Success Rate: ${((testResults.passed / newDocumentTypes.length) * 100).toFixed(1)}%\n`);    // Detailed results by processor (using correct keys)
    console.log('📋 RESULTS BY PROCESSOR:');
    const processorGroups = {
        'ProjectManagementProcessor': ['project-statement-of-work', 'business-case'],
        'PMBOKProcessProcessor': ['perform-integrated-change-control', 'close-project-or-phase'],
        'ScopeManagementProcessor': ['plan-scope-management', 'define-scope', 'work-performance-information-scope'],
        'RequirementsProcessor': ['requirements-management-plan', 'collect-requirements'],
        'WBSProcessor': ['create-wbs'],
        'ActivityProcessor': ['activity-duration-estimates', 'activity-resource-estimates']
    };

    for (const [processor, docTypes] of Object.entries(processorGroups)) {
        const processorResults = testResults.details.filter(r => docTypes.includes(r.docType));
        const passed = processorResults.filter(r => r.status === 'PASS').length;
        console.log(`   ${processor}: ${passed}/${docTypes.length} passed`);
    }

    // Content quality analysis
    console.log('\n📊 CONTENT QUALITY ANALYSIS:');
    const qualityScores = Object.values(testResults.contentQuality);
    if (qualityScores.length > 0) {
        const avgLength = qualityScores.reduce((sum, q) => sum + q.length, 0) / qualityScores.length;
        const avgStructureScore = qualityScores.reduce((sum, q) => sum + q.structureScore, 0) / qualityScores.length;
        const avgDetailScore = qualityScores.reduce((sum, q) => sum + q.detailScore, 0) / qualityScores.length;
        
        console.log(`   Average Content Length: ${Math.round(avgLength)} characters`);
        console.log(`   Average Structure Score: ${avgStructureScore.toFixed(1)}/10`);
        console.log(`   Average Detail Score: ${avgDetailScore.toFixed(1)}/10`);
    }

    // PMBOK compliance analysis
    console.log('\n📚 PMBOK COMPLIANCE ANALYSIS:');
    const complianceScores = Object.values(testResults.pmbokCompliance);
    if (complianceScores.length > 0) {
        const avgCompliance = complianceScores.reduce((sum, c) => sum + c.overallScore, 0) / complianceScores.length;
        const processGroups = complianceScores.filter(c => c.hasProcessGroups).length;
        const knowledgeAreas = complianceScores.filter(c => c.hasKnowledgeAreas).length;
        
        console.log(`   Average PMBOK Compliance Score: ${avgCompliance.toFixed(1)}/10`);
        console.log(`   Documents with Process Groups: ${processGroups}/${complianceScores.length}`);
        console.log(`   Documents with Knowledge Areas: ${knowledgeAreas}/${complianceScores.length}`);
    }

    // Production readiness assessment
    console.log('\n🚀 PRODUCTION READINESS ASSESSMENT:');
    const productionReady = testResults.passed >= newDocumentTypes.length * 0.9; // 90% pass rate
    const averageQuality = qualityScores.length > 0 ? 
        qualityScores.reduce((sum, q) => sum + (q.structureScore + q.detailScore) / 2, 0) / qualityScores.length : 0;
    const averageCompliance = complianceScores.length > 0 ?
        complianceScores.reduce((sum, c) => sum + c.overallScore, 0) / complianceScores.length : 0;

    console.log(`   ✅ Pass Rate: ${((testResults.passed / newDocumentTypes.length) * 100).toFixed(1)}% ${productionReady ? '(READY)' : '(NEEDS IMPROVEMENT)'}`);
    console.log(`   📊 Quality Score: ${averageQuality.toFixed(1)}/10 ${averageQuality >= 7 ? '(GOOD)' : '(NEEDS IMPROVEMENT)'}`);
    console.log(`   📚 PMBOK Compliance: ${averageCompliance.toFixed(1)}/10 ${averageCompliance >= 7 ? '(COMPLIANT)' : '(NEEDS IMPROVEMENT)'}`);

    // Final recommendation
    console.log('\n' + '='.repeat(60));
    if (productionReady && averageQuality >= 7 && averageCompliance >= 7) {
        console.log('🎉 RECOMMENDATION: All 12 new document types are PRODUCTION READY!');
    } else {
        console.log('⚠️  RECOMMENDATION: Some document types need improvement before production deployment.');
    }
    console.log('='.repeat(60));

    process.exit(testResults.failed > 0 ? 1 : 0);

}).catch(error => {
    console.error('❌ Failed to load modules:', error);
    process.exit(1);
});

/**
 * Analyze content quality metrics
 */
function analyzeContentQuality(content) {
    const length = content.length;
    
    // Structure score (0-10) based on headers, sections, lists
    const hasHeaders = (content.match(/#{1,6}\s/g) || []).length;
    const hasLists = (content.match(/^\s*[-*+]\s/gm) || []).length;
    const hasSections = content.split('\n\n').length;
    const structureScore = Math.min(10, (hasHeaders * 2) + (hasLists * 0.5) + (hasSections * 0.1));
    
    // Detail score (0-10) based on content depth and completeness
    const hasDefinitions = content.toLowerCase().includes('definition') || content.toLowerCase().includes('purpose');
    const hasSteps = content.toLowerCase().includes('step') || content.toLowerCase().includes('phase');
    const hasDeliverables = content.toLowerCase().includes('deliverable') || content.toLowerCase().includes('output');
    const hasResponsibilities = content.toLowerCase().includes('responsible') || content.toLowerCase().includes('role');
    const detailScore = (hasDefinitions ? 2.5 : 0) + (hasSteps ? 2.5 : 0) + (hasDeliverables ? 2.5 : 0) + (hasResponsibilities ? 2.5 : 0);
    
    return {
        length,
        structureScore: Math.round(structureScore * 10) / 10,
        detailScore: Math.round(detailScore * 10) / 10,
        hasHeaders: hasHeaders > 0,
        hasLists: hasLists > 0,
        hasSections: hasSections > 3
    };
}

/**
 * Analyze PMBOK compliance
 */
function analyzePMBOKCompliance(content) {
    const lowerContent = content.toLowerCase();
    
    // PMBOK process groups
    const processGroups = ['initiating', 'planning', 'executing', 'monitoring', 'controlling', 'closing'];
    const hasProcessGroups = processGroups.some(pg => lowerContent.includes(pg));
    
    // PMBOK knowledge areas
    const knowledgeAreas = ['integration', 'scope', 'schedule', 'cost', 'quality', 'resource', 'communication', 'risk', 'procurement', 'stakeholder'];
    const hasKnowledgeAreas = knowledgeAreas.some(ka => lowerContent.includes(ka));
    
    // PMBOK terminology
    const pmbokTerms = ['deliverable', 'milestone', 'stakeholder', 'requirement', 'assumption', 'constraint', 'risk', 'issue'];
    const termCount = pmbokTerms.filter(term => lowerContent.includes(term)).length;
    
    // Overall compliance score
    const overallScore = (hasProcessGroups ? 3 : 0) + (hasKnowledgeAreas ? 3 : 0) + (termCount * 0.5);
    
    return {
        hasProcessGroups,
        hasKnowledgeAreas,
        termCount,
        overallScore: Math.min(10, Math.round(overallScore * 10) / 10)
    };
}
