#!/usr/bin/env pwsh

# Script to identify missing Processor.ts and Template.ts files for all generation tasks

Write-Host "🔍 Analyzing Generation Tasks and Required Files..." -ForegroundColor Cyan

# Define all generation task keys from generationTasks.ts
$generationTaskKeys = @(
    'architecture-design', 'system-design', 'database-schema', 'security-design',
    'performance-requirements', 'integration-design', 'technical-stack', 
    'deployment-architecture', 'error-handling', 'test-strategy', 'test-plan',
    'test-cases', 'quality-metrics', 'tech-acceptance-criteria', 'performance-test-plan',
    'security-testing', 'code-review', 'bug-report', 'test-environment', 
    'coding-standards', 'development-setup', 'version-control', 'ci-pipeline',
    'release-process', 'code-documentation', 'troubleshooting', 'development-workflow',
    'api-integration', 'deployment-guide', 'project-summary', 'user-stories',
    'user-personas', 'key-roles-and-needs', 'project-statement-of-work',
    'business-case', 'mission-vision-core-values', 'project-purpose',
    'project-charter', 'project-management-plan', 'direct-and-manage-project-work',
    'perform-integrated-change-control', 'close-project-or-phase', 'plan-scope-management',
    'requirements-management-plan', 'collect-requirements', 'requirements-documentation',
    'requirements-traceability-matrix', 'define-scope', 'project-scope-statement',
    'create-wbs', 'scope-baseline', 'validate-scope', 'control-scope',
    'work-performance-information-scope', 'scope-management-plan', 'risk-management-plan',
    'cost-management-plan', 'quality-management-plan', 'resource-management-plan',
    'communication-management-plan', 'procurement-management-plan', 'stakeholder-engagement-plan',
    'stakeholder-register', 'stakeholder-analysis', 'work-breakdown-structure',
    'wbs-dictionary', 'activity-list', 'activity-duration-estimates',
    'activity-resource-estimates', 'schedule-network-diagram', 'milestone-list',
    'schedule-development-input', 'project-kickoff-preparations-checklist',
    'data-model-suggestions', 'tech-stack-analysis', 'risk-analysis',
    'acceptance-criteria', 'compliance-considerations', 'ui-ux-considerations',
    'babokintroduction', 'company-values', 'purpose-statement', 'strategic-business-case',
    'scope-statement', 'risk-register', 'apidocumentation', 'schedule-management-plan',
    'quality-management-plsn', 'monitor-and-control-project-work', 'develop-project-charter',
    'validate-scope-process', 'control-scope-process', 'perform-integration-change-control-process',
    'close-project-phase-process', 'summary-and-goals', 'core-values', 'develop-schedule-input',
    'key-rbacroles', 'collect-requirements-process'
)

$missingProcessors = @()
$missingTemplates = @()

Write-Host "`n📊 Checking $($generationTaskKeys.Count) generation tasks..." -ForegroundColor Yellow

foreach ($key in $generationTaskKeys) {
    # Convert kebab-case to PascalCase for file names
    $pascalCase = ($key -split '-' | ForEach-Object { 
        $_.Substring(0,1).ToUpper() + $_.Substring(1).ToLower() 
    }) -join ''
    
    # Check for Processor file
    $processorFile = Get-ChildItem -Recurse -Path "src\modules\documentTemplates" -Filter "*${pascalCase}Processor.ts" -ErrorAction SilentlyContinue
    if (-not $processorFile) {
        $missingProcessors += $key
    }
    
    # Check for Template file  
    $templateFile = Get-ChildItem -Recurse -Path "src\modules\documentTemplates" -Filter "*${pascalCase}Template.ts" -ErrorAction SilentlyContinue
    if (-not $templateFile) {
        $missingTemplates += $key
    }
}

Write-Host "`n❌ Missing Processor Files ($($missingProcessors.Count)):" -ForegroundColor Red
foreach ($missing in $missingProcessors) {
    $pascalCase = ($missing -split '-' | ForEach-Object { 
        $_.Substring(0,1).ToUpper() + $_.Substring(1).ToLower() 
    }) -join ''
    Write-Host "   - $missing -> ${pascalCase}Processor.ts" -ForegroundColor Red
}

Write-Host "`n❌ Missing Template Files ($($missingTemplates.Count)):" -ForegroundColor Red
foreach ($missing in $missingTemplates) {
    $pascalCase = ($missing -split '-' | ForEach-Object { 
        $_.Substring(0,1).ToUpper() + $_.Substring(1).ToLower() 
    }) -join ''
    Write-Host "   - $missing -> ${pascalCase}Template.ts" -ForegroundColor Red
}

$totalMissing = $missingProcessors.Count + $missingTemplates.Count
Write-Host "`n📈 Summary:" -ForegroundColor Cyan
Write-Host "   Total Generation Tasks: $($generationTaskKeys.Count)" -ForegroundColor White
Write-Host "   Missing Processors: $($missingProcessors.Count)" -ForegroundColor Red
Write-Host "   Missing Templates: $($missingTemplates.Count)" -ForegroundColor Red
Write-Host "   Total Missing Files: $totalMissing" -ForegroundColor Red

if ($totalMissing -eq 0) {
    Write-Host "`nAll generation tasks have complete Processor and Template files!" -ForegroundColor Green
} else {
    Write-Host "Need to create $totalMissing files to complete the system" -ForegroundColor Yellow
}
