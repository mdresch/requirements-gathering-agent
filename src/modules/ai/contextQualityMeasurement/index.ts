/**
 * Context Quality Measurement Module
 * 
 * This module provides comprehensive tools for measuring and comparing
 * LLM response quality across different context window sizes, enabling
 * data-driven decisions about when and how to utilize larger context windows.
 * 
 * Key Features:
 * - A/B testing infrastructure for context window comparisons
 * - Automated quality scoring algorithms
 * - Project library loading for full context utilization
 * - Comprehensive measurement and reporting framework
 */

export { ContextQualityMeasurementFramework } from './ContextQualityMeasurementFramework.js';
export { ProjectLibraryLoader } from './ProjectLibraryLoader.js';
export { ContextABTesting } from './ContextABTesting.js';
export { QualityScoringAlgorithms } from './QualityScoringAlgorithms.js';

// Re-export types for convenience
export type {
    QualityMetric,
    ContextTestResult,
    ContextComparisonResult
} from './ContextQualityMeasurementFramework.js';

export type {
    ProjectFile,
    ProjectLibrary,
    LibraryLoadOptions
} from './ProjectLibraryLoader.js';

export type {
    ABTestConfiguration,
    ContextConfiguration,
    ABTestResult,
    ABTestIteration
} from './ContextABTesting.js';

export type {
    QualityScore,
    DocumentAnalysis,
    ComparisonAnalysis
} from './QualityScoringAlgorithms.js';

/**
 * Quick Start Guide
 * 
 * 1. Run a simple comparison test:
 * ```typescript
 * import { ContextABTesting } from './contextQualityMeasurement';
 * 
 * const abTesting = ContextABTesting.getInstance();
 * const result = await abTesting.runQuickComparison(
 *     './my-project',
 *     'project-charter',
 *     ['limited_8k', 'full_1m']
 * );
 * console.log(`Quality improvement: ${result.improvementMetrics.overallImprovement}%`);
 * ```
 * 
 * 2. Load entire project library for large context windows:
 * ```typescript
 * import { ProjectLibraryLoader } from './contextQualityMeasurement';
 * 
 * const loader = ProjectLibraryLoader.getInstance();
 * const library = await loader.loadProjectLibrary('./my-project', {
 *     maxTokens: 1000000,
 *     prioritizeRecent: true
 * });
 * const context = await loader.libraryToContext(library, { format: 'structured' });
 * ```
 * 
 * 3. Run comprehensive A/B test:
 * ```typescript
 * import { ContextABTesting } from './contextQualityMeasurement';
 * 
 * const abTesting = ContextABTesting.getInstance();
 * const testResult = await abTesting.runABTest('./my-project', {
 *     documentTypes: ['project-charter', 'requirements-documentation'],
 *     maxIterations: 10
 * });
 * console.log(`Best configuration: ${testResult.summary.bestConfiguration}`);
 * ```
 * 
 * 4. Analyze document quality:
 * ```typescript
 * import { QualityScoringAlgorithms } from './contextQualityMeasurement';
 * 
 * const scorer = QualityScoringAlgorithms.getInstance();
 * const analysis = await scorer.analyzeDocumentQuality(
 *     documentContent,
 *     { documentType: 'project-charter', contextSize: 1000000, modelUsed: 'gemini-1.5-pro' },
 *     projectContext
 * );
 * console.log(`Overall quality score: ${analysis.overallScore}/100`);
 * ```
 */

/**
 * Best Practices for Context Quality Measurement
 * 
 * 1. **Start Small**: Begin with quick comparisons on a few document types
 * 2. **Use Representative Samples**: Test with typical project documents
 * 3. **Monitor Costs**: Track token usage and costs alongside quality improvements
 * 4. **Iterate**: Run multiple tests to establish baselines and trends
 * 5. **Document Results**: Save test results for future reference and analysis
 * 6. **Set Thresholds**: Define clear criteria for when to use larger context windows
 * 
 * Expected Results:
 * - Quality improvements of 10-30% are common with larger context windows
 * - ROI typically ranges from 2-5x for high-value documents
 * - Consistency improvements are often more significant than raw quality scores
 * - Project-specific documents show larger improvements than generic templates
 */

/**
 * Integration with Existing Systems
 * 
 * This module is designed to integrate seamlessly with your existing
 * document generation pipeline:
 * 
 * 1. **Context Manager Integration**: Works with existing ContextManager
 * 2. **Configuration Management**: Uses existing ConfigurationManager
 * 3. **Document Generation**: Integrates with existing document generation workflows
 * 4. **Quality Assessment**: Can be used alongside existing quality checks
 * 
 * The framework provides both automated and human-evaluated metrics,
 * allowing you to choose the appropriate level of assessment for your needs.
 */
