# SharePoint Upload Script for Requirements Gathering Agent Documents
# This script uploads all generated markdown documents to SharePoint with proper folder structure
# Date: June 19, 2025

Write-Host "Starting SharePoint upload process..." -ForegroundColor Green
Write-Host "Total files to upload: 95" -ForegroundColor Yellow

# Counter for progress tracking
$fileCount = 0
$totalFiles = 95

# Function to display progress
function Show-Progress {
    param($current, $total, $fileName)
    $percent = [math]::Round(($current / $total) * 100, 2)
    Write-Host "[$current/$total] ($percent%) Uploading: $fileName" -ForegroundColor Cyan
}

try {
    # Root level files
    $fileCount++; Show-Progress $fileCount $totalFiles "compliance-report.md"
    m365 file add --filePath "C:\Users\menno\Source\Repos\requirements-gathering-agent\generated-documents\compliance-report.md" --folderUrl "https://cbadmin.sharepoint.com/sites/RequirementsGatheringAgent/Gedeelde documenten"

    $fileCount++; Show-Progress $fileCount $totalFiles "README.md"
    m365 file add --filePath "C:\Users\menno\Source\Repos\requirements-gathering-agent\generated-documents\README.md" --folderUrl "https://cbadmin.sharepoint.com/sites/RequirementsGatheringAgent/Gedeelde documenten"

    # Basic docs folder
    Write-Host "`n--- Uploading basic-docs folder ---" -ForegroundColor Magenta
    
    $fileCount++; Show-Progress $fileCount $totalFiles "business-case.md"
    m365 file add --filePath "C:\Users\menno\Source\Repos\requirements-gathering-agent\generated-documents\basic-docs\business-case.md" --folderUrl "https://cbadmin.sharepoint.com/sites/RequirementsGatheringAgent/Gedeelde documenten/basic-docs"

    $fileCount++; Show-Progress $fileCount $totalFiles "common-challenges-user-personas.md"
    m365 file add --filePath "C:\Users\menno\Source\Repos\requirements-gathering-agent\generated-documents\basic-docs\common-challenges-user-personas.md" --folderUrl "https://cbadmin.sharepoint.com/sites/RequirementsGatheringAgent/Gedeelde documenten/basic-docs"

    $fileCount++; Show-Progress $fileCount $totalFiles "common-goals-user-personas.md"
    m365 file add --filePath "C:\Users\menno\Source\Repos\requirements-gathering-agent\generated-documents\basic-docs\common-goals-user-personas.md" --folderUrl "https://cbadmin.sharepoint.com/sites/RequirementsGatheringAgent/Gedeelde documenten/basic-docs"

    $fileCount++; Show-Progress $fileCount $totalFiles "core-values.md"
    m365 file add --filePath "C:\Users\menno\Source\Repos\requirements-gathering-agent\generated-documents\basic-docs\core-values.md" --folderUrl "https://cbadmin.sharepoint.com/sites/RequirementsGatheringAgent/Gedeelde documenten/basic-docs"

    $fileCount++; Show-Progress $fileCount $totalFiles "develop-schedule-input.md"
    m365 file add --filePath "C:\Users\menno\Source\Repos\requirements-gathering-agent\generated-documents\basic-docs\develop-schedule-input.md" --folderUrl "https://cbadmin.sharepoint.com/sites/RequirementsGatheringAgent/Gedeelde documenten/basic-docs"

    $fileCount++; Show-Progress $fileCount $totalFiles "key-roles-and-needs.md"
    m365 file add --filePath "C:\Users\menno\Source\Repos\requirements-gathering-agent\generated-documents\basic-docs\key-roles-and-needs.md" --folderUrl "https://cbadmin.sharepoint.com/sites/RequirementsGatheringAgent/Gedeelde documenten/basic-docs"

    $fileCount++; Show-Progress $fileCount $totalFiles "persona-utilize-app.md"
    m365 file add --filePath "C:\Users\menno\Source\Repos\requirements-gathering-agent\generated-documents\basic-docs\persona-utilize-app.md" --folderUrl "https://cbadmin.sharepoint.com/sites/RequirementsGatheringAgent/Gedeelde documenten/basic-docs"

    $fileCount++; Show-Progress $fileCount $totalFiles "personas-assess-motivations.md"
    m365 file add --filePath "C:\Users\menno\Source\Repos\requirements-gathering-agent\generated-documents\basic-docs\personas-assess-motivations.md" --folderUrl "https://cbadmin.sharepoint.com/sites/RequirementsGatheringAgent/Gedeelde documenten/basic-docs"

    $fileCount++; Show-Progress $fileCount $totalFiles "project-statement-of-work.md"
    m365 file add --filePath "C:\Users\menno\Source\Repos\requirements-gathering-agent\generated-documents\basic-docs\project-statement-of-work.md" --folderUrl "https://cbadmin.sharepoint.com/sites/RequirementsGatheringAgent/Gedeelde documenten/basic-docs"

    $fileCount++; Show-Progress $fileCount $totalFiles "project-summary.md"
    m365 file add --filePath "C:\Users\menno\Source\Repos\requirements-gathering-agent\generated-documents\basic-docs\project-summary.md" --folderUrl "https://cbadmin.sharepoint.com/sites/RequirementsGatheringAgent/Gedeelde documenten/basic-docs"

    $fileCount++; Show-Progress $fileCount $totalFiles "summary-and-goals.md"
    m365 file add --filePath "C:\Users\menno\Source\Repos\requirements-gathering-agent\generated-documents\basic-docs\summary-and-goals.md" --folderUrl "https://cbadmin.sharepoint.com/sites/RequirementsGatheringAgent/Gedeelde documenten/basic-docs"

    $fileCount++; Show-Progress $fileCount $totalFiles "technology-comfort-user-personas.md"
    m365 file add --filePath "C:\Users\menno\Source\Repos\requirements-gathering-agent\generated-documents\basic-docs\technology-comfort-user-personas.md" --folderUrl "https://cbadmin.sharepoint.com/sites/RequirementsGatheringAgent/Gedeelde documenten/basic-docs"

    $fileCount++; Show-Progress $fileCount $totalFiles "user-personas.md"
    m365 file add --filePath "C:\Users\menno\Source\Repos\requirements-gathering-agent\generated-documents\basic-docs\user-personas.md" --folderUrl "https://cbadmin.sharepoint.com/sites/RequirementsGatheringAgent/Gedeelde documenten/basic-docs"

    $fileCount++; Show-Progress $fileCount $totalFiles "user-stories.md"
    m365 file add --filePath "C:\Users\menno\Source\Repos\requirements-gathering-agent\generated-documents\basic-docs\user-stories.md" --folderUrl "https://cbadmin.sharepoint.com/sites/RequirementsGatheringAgent/Gedeelde documenten/basic-docs"

    # Implementation guides folder
    Write-Host "`n--- Uploading implementation-guides folder ---" -ForegroundColor Magenta

    $fileCount++; Show-Progress $fileCount $totalFiles "api-integration.md"
    m365 file add --filePath "C:\Users\menno\Source\Repos\requirements-gathering-agent\generated-documents\implementation-guides\api-integration.md" --folderUrl "https://cbadmin.sharepoint.com/sites/RequirementsGatheringAgent/Gedeelde documenten/implementation-guides"

    $fileCount++; Show-Progress $fileCount $totalFiles "ci-pipeline.md"
    m365 file add --filePath "C:\Users\menno\Source\Repos\requirements-gathering-agent\generated-documents\implementation-guides\ci-pipeline.md" --folderUrl "https://cbadmin.sharepoint.com/sites/RequirementsGatheringAgent/Gedeelde documenten/implementation-guides"

    $fileCount++; Show-Progress $fileCount $totalFiles "code-documentation.md"
    m365 file add --filePath "C:\Users\menno\Source\Repos\requirements-gathering-agent\generated-documents\implementation-guides\code-documentation.md" --folderUrl "https://cbadmin.sharepoint.com/sites/RequirementsGatheringAgent/Gedeelde documenten/implementation-guides"

    $fileCount++; Show-Progress $fileCount $totalFiles "coding-standards.md"
    m365 file add --filePath "C:\Users\menno\Source\Repos\requirements-gathering-agent\generated-documents\implementation-guides\coding-standards.md" --folderUrl "https://cbadmin.sharepoint.com/sites/RequirementsGatheringAgent/Gedeelde documenten/implementation-guides"

    $fileCount++; Show-Progress $fileCount $totalFiles "deployment-guide.md"
    m365 file add --filePath "C:\Users\menno\Source\Repos\requirements-gathering-agent\generated-documents\implementation-guides\deployment-guide.md" --folderUrl "https://cbadmin.sharepoint.com/sites/RequirementsGatheringAgent/Gedeelde documenten/implementation-guides"

    $fileCount++; Show-Progress $fileCount $totalFiles "development-setup.md"
    m365 file add --filePath "C:\Users\menno\Source\Repos\requirements-gathering-agent\generated-documents\implementation-guides\development-setup.md" --folderUrl "https://cbadmin.sharepoint.com/sites/RequirementsGatheringAgent/Gedeelde documenten/implementation-guides"

    $fileCount++; Show-Progress $fileCount $totalFiles "development-workflow.md"
    m365 file add --filePath "C:\Users\menno\Source\Repos\requirements-gathering-agent\generated-documents\implementation-guides\development-workflow.md" --folderUrl "https://cbadmin.sharepoint.com/sites/RequirementsGatheringAgent/Gedeelde documenten/implementation-guides"

    $fileCount++; Show-Progress $fileCount $totalFiles "release-process.md"
    m365 file add --filePath "C:\Users\menno\Source\Repos\requirements-gathering-agent\generated-documents\implementation-guides\release-process.md" --folderUrl "https://cbadmin.sharepoint.com/sites/RequirementsGatheringAgent/Gedeelde documenten/implementation-guides"

    $fileCount++; Show-Progress $fileCount $totalFiles "troubleshooting.md"
    m365 file add --filePath "C:\Users\menno\Source\Repos\requirements-gathering-agent\generated-documents\implementation-guides\troubleshooting.md" --folderUrl "https://cbadmin.sharepoint.com/sites/RequirementsGatheringAgent/Gedeelde documenten/implementation-guides"

    $fileCount++; Show-Progress $fileCount $totalFiles "version-control.md"
    m365 file add --filePath "C:\Users\menno\Source\Repos\requirements-gathering-agent\generated-documents\implementation-guides\version-control.md" --folderUrl "https://cbadmin.sharepoint.com/sites/RequirementsGatheringAgent/Gedeelde documenten/implementation-guides"

    # Management plans folder
    Write-Host "`n--- Uploading management-plans folder ---" -ForegroundColor Magenta

    $fileCount++; Show-Progress $fileCount $totalFiles "close-project-or-phase.md"
    m365 file add --filePath "C:\Users\menno\Source\Repos\requirements-gathering-agent\generated-documents\management-plans\close-project-or-phase.md" --folderUrl "https://cbadmin.sharepoint.com/sites/RequirementsGatheringAgent/Gedeelde documenten/management-plans"

    $fileCount++; Show-Progress $fileCount $totalFiles "collect-requirements.md"
    m365 file add --filePath "C:\Users\menno\Source\Repos\requirements-gathering-agent\generated-documents\management-plans\collect-requirements.md" --folderUrl "https://cbadmin.sharepoint.com/sites/RequirementsGatheringAgent/Gedeelde documenten/management-plans"

    $fileCount++; Show-Progress $fileCount $totalFiles "communication-management-plan.md"
    m365 file add --filePath "C:\Users\menno\Source\Repos\requirements-gathering-agent\generated-documents\management-plans\communication-management-plan.md" --folderUrl "https://cbadmin.sharepoint.com/sites/RequirementsGatheringAgent/Gedeelde documenten/management-plans"

    $fileCount++; Show-Progress $fileCount $totalFiles "cost-management-plan.md"
    m365 file add --filePath "C:\Users\menno\Source\Repos\requirements-gathering-agent\generated-documents\management-plans\cost-management-plan.md" --folderUrl "https://cbadmin.sharepoint.com/sites/RequirementsGatheringAgent/Gedeelde documenten/management-plans"

    $fileCount++; Show-Progress $fileCount $totalFiles "create-wbs.md"
    m365 file add --filePath "C:\Users\menno\Source\Repos\requirements-gathering-agent\generated-documents\management-plans\create-wbs.md" --folderUrl "https://cbadmin.sharepoint.com/sites/RequirementsGatheringAgent/Gedeelde documenten/management-plans"

    $fileCount++; Show-Progress $fileCount $totalFiles "direct-and-manage-project-work.md"
    m365 file add --filePath "C:\Users\menno\Source\Repos\requirements-gathering-agent\generated-documents\management-plans\direct-and-manage-project-work.md" --folderUrl "https://cbadmin.sharepoint.com/sites/RequirementsGatheringAgent/Gedeelde documenten/management-plans"

    $fileCount++; Show-Progress $fileCount $totalFiles "perform-integrated-change-control.md"
    m365 file add --filePath "C:\Users\menno\Source\Repos\requirements-gathering-agent\generated-documents\management-plans\perform-integrated-change-control.md" --folderUrl "https://cbadmin.sharepoint.com/sites/RequirementsGatheringAgent/Gedeelde documenten/management-plans"

    $fileCount++; Show-Progress $fileCount $totalFiles "procurement-management-plan.md"
    m365 file add --filePath "C:\Users\menno\Source\Repos\requirements-gathering-agent\generated-documents\management-plans\procurement-management-plan.md" --folderUrl "https://cbadmin.sharepoint.com/sites/RequirementsGatheringAgent/Gedeelde documenten/management-plans"

    $fileCount++; Show-Progress $fileCount $totalFiles "quality-management-plan.md"
    m365 file add --filePath "C:\Users\menno\Source\Repos\requirements-gathering-agent\generated-documents\management-plans\quality-management-plan.md" --folderUrl "https://cbadmin.sharepoint.com/sites/RequirementsGatheringAgent/Gedeelde documenten/management-plans"

    $fileCount++; Show-Progress $fileCount $totalFiles "requirements-documentation.md"
    m365 file add --filePath "C:\Users\menno\Source\Repos\requirements-gathering-agent\generated-documents\management-plans\requirements-documentation.md" --folderUrl "https://cbadmin.sharepoint.com/sites/RequirementsGatheringAgent/Gedeelde documenten/management-plans"

    $fileCount++; Show-Progress $fileCount $totalFiles "requirements-management-plan.md"
    m365 file add --filePath "C:\Users\menno\Source\Repos\requirements-gathering-agent\generated-documents\management-plans\requirements-management-plan.md" --folderUrl "https://cbadmin.sharepoint.com/sites/RequirementsGatheringAgent/Gedeelde documenten/management-plans"

    $fileCount++; Show-Progress $fileCount $totalFiles "requirements-traceability-matrix.md"
    m365 file add --filePath "C:\Users\menno\Source\Repos\requirements-gathering-agent\generated-documents\management-plans\requirements-traceability-matrix.md" --folderUrl "https://cbadmin.sharepoint.com/sites/RequirementsGatheringAgent/Gedeelde documenten/management-plans"

    $fileCount++; Show-Progress $fileCount $totalFiles "resource-management-plan.md"
    m365 file add --filePath "C:\Users\menno\Source\Repos\requirements-gathering-agent\generated-documents\management-plans\resource-management-plan.md" --folderUrl "https://cbadmin.sharepoint.com/sites/RequirementsGatheringAgent/Gedeelde documenten/management-plans"

    $fileCount++; Show-Progress $fileCount $totalFiles "risk-management-plan.md"
    m365 file add --filePath "C:\Users\menno\Source\Repos\requirements-gathering-agent\generated-documents\management-plans\risk-management-plan.md" --folderUrl "https://cbadmin.sharepoint.com/sites/RequirementsGatheringAgent/Gedeelde documenten/management-plans"

    # Planning folder
    Write-Host "`n--- Uploading planning folder ---" -ForegroundColor Magenta

    $fileCount++; Show-Progress $fileCount $totalFiles "activity-duration-estimates.md"
    m365 file add --filePath "C:\Users\menno\Source\Repos\requirements-gathering-agent\generated-documents\planning\activity-duration-estimates.md" --folderUrl "https://cbadmin.sharepoint.com/sites/RequirementsGatheringAgent/Gedeelde documenten/planning"

    $fileCount++; Show-Progress $fileCount $totalFiles "activity-list.md"
    m365 file add --filePath "C:\Users\menno\Source\Repos\requirements-gathering-agent\generated-documents\planning\activity-list.md" --folderUrl "https://cbadmin.sharepoint.com/sites/RequirementsGatheringAgent/Gedeelde documenten/planning"

    $fileCount++; Show-Progress $fileCount $totalFiles "activity-resource-estimates.md"
    m365 file add --filePath "C:\Users\menno\Source\Repos\requirements-gathering-agent\generated-documents\planning\activity-resource-estimates.md" --folderUrl "https://cbadmin.sharepoint.com/sites/RequirementsGatheringAgent/Gedeelde documenten/planning"

    $fileCount++; Show-Progress $fileCount $totalFiles "milestone-list.md"
    m365 file add --filePath "C:\Users\menno\Source\Repos\requirements-gathering-agent\generated-documents\planning\milestone-list.md" --folderUrl "https://cbadmin.sharepoint.com/sites/RequirementsGatheringAgent/Gedeelde documenten/planning"

    $fileCount++; Show-Progress $fileCount $totalFiles "Project-KickOff-Preprations-CheckList.md"
    m365 file add --filePath "C:\Users\menno\Source\Repos\requirements-gathering-agent\generated-documents\planning\Project-KickOff-Preprations-CheckList.md" --folderUrl "https://cbadmin.sharepoint.com/sites/RequirementsGatheringAgent/Gedeelde documenten/planning"

    $fileCount++; Show-Progress $fileCount $totalFiles "schedule-development-input.md"
    m365 file add --filePath "C:\Users\menno\Source\Repos\requirements-gathering-agent\generated-documents\planning\schedule-development-input.md" --folderUrl "https://cbadmin.sharepoint.com/sites/RequirementsGatheringAgent/Gedeelde documenten/planning"

    $fileCount++; Show-Progress $fileCount $totalFiles "schedule-network-diagram.md"
    m365 file add --filePath "C:\Users\menno\Source\Repos\requirements-gathering-agent\generated-documents\planning\schedule-network-diagram.md" --folderUrl "https://cbadmin.sharepoint.com/sites/RequirementsGatheringAgent/Gedeelde documenten/planning"

    $fileCount++; Show-Progress $fileCount $totalFiles "wbs-dictionary.md"
    m365 file add --filePath "C:\Users\menno\Source\Repos\requirements-gathering-agent\generated-documents\planning\wbs-dictionary.md" --folderUrl "https://cbadmin.sharepoint.com/sites/RequirementsGatheringAgent/Gedeelde documenten/planning"

    $fileCount++; Show-Progress $fileCount $totalFiles "work-breakdown-structure.md"
    m365 file add --filePath "C:\Users\menno\Source\Repos\requirements-gathering-agent\generated-documents\planning\work-breakdown-structure.md" --folderUrl "https://cbadmin.sharepoint.com/sites/RequirementsGatheringAgent/Gedeelde documenten/planning"

    # PMBOK folder
    Write-Host "`n--- Uploading pmbok folder ---" -ForegroundColor Magenta

    $fileCount++; Show-Progress $fileCount $totalFiles "close-project-phase-process.md"
    m365 file add --filePath "C:\Users\menno\Source\Repos\requirements-gathering-agent\generated-documents\pmbok\close-project-phase-process.md" --folderUrl "https://cbadmin.sharepoint.com/sites/RequirementsGatheringAgent/Gedeelde documenten/pmbok"

    $fileCount++; Show-Progress $fileCount $totalFiles "control-scope-process.md"
    m365 file add --filePath "C:\Users\menno\Source\Repos\requirements-gathering-agent\generated-documents\pmbok\control-scope-process.md" --folderUrl "https://cbadmin.sharepoint.com/sites/RequirementsGatheringAgent/Gedeelde documenten/pmbok"

    $fileCount++; Show-Progress $fileCount $totalFiles "develop-project-charter.md"
    m365 file add --filePath "C:\Users\menno\Source\Repos\requirements-gathering-agent\generated-documents\pmbok\develop-project-charter.md" --folderUrl "https://cbadmin.sharepoint.com/sites/RequirementsGatheringAgent/Gedeelde documenten/pmbok"

    $fileCount++; Show-Progress $fileCount $totalFiles "monitor-and-control-project-work.md"
    m365 file add --filePath "C:\Users\menno\Source\Repos\requirements-gathering-agent\generated-documents\pmbok\monitor-and-control-project-work.md" --folderUrl "https://cbadmin.sharepoint.com/sites/RequirementsGatheringAgent/Gedeelde documenten/pmbok"

    $fileCount++; Show-Progress $fileCount $totalFiles "perform-integration-change-control-process.md"
    m365 file add --filePath "C:\Users\menno\Source\Repos\requirements-gathering-agent\generated-documents\pmbok\perform-integration-change-control-process.md" --folderUrl "https://cbadmin.sharepoint.com/sites/RequirementsGatheringAgent/Gedeelde documenten/pmbok"

    $fileCount++; Show-Progress $fileCount $totalFiles "validate-scope-process.md"
    m365 file add --filePath "C:\Users\menno\Source\Repos\requirements-gathering-agent\generated-documents\pmbok\validate-scope-process.md" --folderUrl "https://cbadmin.sharepoint.com/sites/RequirementsGatheringAgent/Gedeelde documenten/pmbok"

    # Project charter folder
    Write-Host "`n--- Uploading project-charter folder ---" -ForegroundColor Magenta

    $fileCount++; Show-Progress $fileCount $totalFiles "project-charter.md"
    m365 file add --filePath "C:\Users\menno\Source\Repos\requirements-gathering-agent\generated-documents\project-charter\project-charter.md" --folderUrl "https://cbadmin.sharepoint.com/sites/RequirementsGatheringAgent/Gedeelde documenten/project-charter"

    $fileCount++; Show-Progress $fileCount $totalFiles "project-management-plan.md"
    m365 file add --filePath "C:\Users\menno\Source\Repos\requirements-gathering-agent\generated-documents\project-charter\project-management-plan.md" --folderUrl "https://cbadmin.sharepoint.com/sites/RequirementsGatheringAgent/Gedeelde documenten/project-charter"

    # Quality assurance folder
    Write-Host "`n--- Uploading quality-assurance folder ---" -ForegroundColor Magenta

    $fileCount++; Show-Progress $fileCount $totalFiles "bug-report.md"
    m365 file add --filePath "C:\Users\menno\Source\Repos\requirements-gathering-agent\generated-documents\quality-assurance\bug-report.md" --folderUrl "https://cbadmin.sharepoint.com/sites/RequirementsGatheringAgent/Gedeelde documenten/quality-assurance"

    $fileCount++; Show-Progress $fileCount $totalFiles "code-review.md"
    m365 file add --filePath "C:\Users\menno\Source\Repos\requirements-gathering-agent\generated-documents\quality-assurance\code-review.md" --folderUrl "https://cbadmin.sharepoint.com/sites/RequirementsGatheringAgent/Gedeelde documenten/quality-assurance"

    $fileCount++; Show-Progress $fileCount $totalFiles "performance-test-plan.md"
    m365 file add --filePath "C:\Users\menno\Source\Repos\requirements-gathering-agent\generated-documents\quality-assurance\performance-test-plan.md" --folderUrl "https://cbadmin.sharepoint.com/sites/RequirementsGatheringAgent/Gedeelde documenten/quality-assurance"

    $fileCount++; Show-Progress $fileCount $totalFiles "quality-metrics.md"
    m365 file add --filePath "C:\Users\menno\Source\Repos\requirements-gathering-agent\generated-documents\quality-assurance\quality-metrics.md" --folderUrl "https://cbadmin.sharepoint.com/sites/RequirementsGatheringAgent/Gedeelde documenten/quality-assurance"

    $fileCount++; Show-Progress $fileCount $totalFiles "security-testing.md"
    m365 file add --filePath "C:\Users\menno\Source\Repos\requirements-gathering-agent\generated-documents\quality-assurance\security-testing.md" --folderUrl "https://cbadmin.sharepoint.com/sites/RequirementsGatheringAgent/Gedeelde documenten/quality-assurance"

    $fileCount++; Show-Progress $fileCount $totalFiles "tech-acceptance-criteria.md"
    m365 file add --filePath "C:\Users\menno\Source\Repos\requirements-gathering-agent\generated-documents\quality-assurance\tech-acceptance-criteria.md" --folderUrl "https://cbadmin.sharepoint.com/sites/RequirementsGatheringAgent/Gedeelde documenten/quality-assurance"

    $fileCount++; Show-Progress $fileCount $totalFiles "test-cases.md"
    m365 file add --filePath "C:\Users\menno\Source\Repos\requirements-gathering-agent\generated-documents\quality-assurance\test-cases.md" --folderUrl "https://cbadmin.sharepoint.com/sites/RequirementsGatheringAgent/Gedeelde documenten/quality-assurance"

    $fileCount++; Show-Progress $fileCount $totalFiles "test-environment.md"
    m365 file add --filePath "C:\Users\menno\Source\Repos\requirements-gathering-agent\generated-documents\quality-assurance\test-environment.md" --folderUrl "https://cbadmin.sharepoint.com/sites/RequirementsGatheringAgent/Gedeelde documenten/quality-assurance"

    $fileCount++; Show-Progress $fileCount $totalFiles "test-plan.md"
    m365 file add --filePath "C:\Users\menno\Source\Repos\requirements-gathering-agent\generated-documents\quality-assurance\test-plan.md" --folderUrl "https://cbadmin.sharepoint.com/sites/RequirementsGatheringAgent/Gedeelde documenten/quality-assurance"

    $fileCount++; Show-Progress $fileCount $totalFiles "test-strategy.md"
    m365 file add --filePath "C:\Users\menno\Source\Repos\requirements-gathering-agent\generated-documents\quality-assurance\test-strategy.md" --folderUrl "https://cbadmin.sharepoint.com/sites/RequirementsGatheringAgent/Gedeelde documenten/quality-assurance"

    # Requirements folder
    Write-Host "`n--- Uploading requirements folder ---" -ForegroundColor Magenta

    $fileCount++; Show-Progress $fileCount $totalFiles "collect-requirements-process.md"
    m365 file add --filePath "C:\Users\menno\Source\Repos\requirements-gathering-agent\generated-documents\requirements\collect-requirements-process.md" --folderUrl "https://cbadmin.sharepoint.com/sites/RequirementsGatheringAgent/Gedeelde documenten/requirements"

    $fileCount++; Show-Progress $fileCount $totalFiles "key-rbacroles.md"
    m365 file add --filePath "C:\Users\menno\Source\Repos\requirements-gathering-agent\generated-documents\requirements\key-rbacroles.md" --folderUrl "https://cbadmin.sharepoint.com/sites/RequirementsGatheringAgent/Gedeelde documenten/requirements"

    # Risk management folder
    Write-Host "`n--- Uploading risk-management folder ---" -ForegroundColor Magenta

    $fileCount++; Show-Progress $fileCount $totalFiles "risk-register.md"
    m365 file add --filePath "C:\Users\menno\Source\Repos\requirements-gathering-agent\generated-documents\risk-management\risk-register.md" --folderUrl "https://cbadmin.sharepoint.com/sites/RequirementsGatheringAgent/Gedeelde documenten/risk-management"

    # Scope management folder
    Write-Host "`n--- Uploading scope-management folder ---" -ForegroundColor Magenta

    $fileCount++; Show-Progress $fileCount $totalFiles "control-scope.md"
    m365 file add --filePath "C:\Users\menno\Source\Repos\requirements-gathering-agent\generated-documents\scope-management\control-scope.md" --folderUrl "https://cbadmin.sharepoint.com/sites/RequirementsGatheringAgent/Gedeelde documenten/scope-management"

    $fileCount++; Show-Progress $fileCount $totalFiles "define-scope.md"
    m365 file add --filePath "C:\Users\menno\Source\Repos\requirements-gathering-agent\generated-documents\scope-management\define-scope.md" --folderUrl "https://cbadmin.sharepoint.com/sites/RequirementsGatheringAgent/Gedeelde documenten/scope-management"

    $fileCount++; Show-Progress $fileCount $totalFiles "plan-scope-management.md"
    m365 file add --filePath "C:\Users\menno\Source\Repos\requirements-gathering-agent\generated-documents\scope-management\plan-scope-management.md" --folderUrl "https://cbadmin.sharepoint.com/sites/RequirementsGatheringAgent/Gedeelde documenten/scope-management"

    $fileCount++; Show-Progress $fileCount $totalFiles "project-scope-statement.md"
    m365 file add --filePath "C:\Users\menno\Source\Repos\requirements-gathering-agent\generated-documents\scope-management\project-scope-statement.md" --folderUrl "https://cbadmin.sharepoint.com/sites/RequirementsGatheringAgent/Gedeelde documenten/scope-management"

    $fileCount++; Show-Progress $fileCount $totalFiles "scope-baseline.md"
    m365 file add --filePath "C:\Users\menno\Source\Repos\requirements-gathering-agent\generated-documents\scope-management\scope-baseline.md" --folderUrl "https://cbadmin.sharepoint.com/sites/RequirementsGatheringAgent/Gedeelde documenten/scope-management"

    $fileCount++; Show-Progress $fileCount $totalFiles "scope-management-plan.md"
    m365 file add --filePath "C:\Users\menno\Source\Repos\requirements-gathering-agent\generated-documents\scope-management\scope-management-plan.md" --folderUrl "https://cbadmin.sharepoint.com/sites/RequirementsGatheringAgent/Gedeelde documenten/scope-management"

    $fileCount++; Show-Progress $fileCount $totalFiles "scope-statement.md"
    m365 file add --filePath "C:\Users\menno\Source\Repos\requirements-gathering-agent\generated-documents\scope-management\scope-statement.md" --folderUrl "https://cbadmin.sharepoint.com/sites/RequirementsGatheringAgent/Gedeelde documenten/scope-management"

    $fileCount++; Show-Progress $fileCount $totalFiles "validate-scope.md"
    m365 file add --filePath "C:\Users\menno\Source\Repos\requirements-gathering-agent\generated-documents\scope-management\validate-scope.md" --folderUrl "https://cbadmin.sharepoint.com/sites/RequirementsGatheringAgent/Gedeelde documenten/scope-management"

    $fileCount++; Show-Progress $fileCount $totalFiles "work-performance-information-scope.md"
    m365 file add --filePath "C:\Users\menno\Source\Repos\requirements-gathering-agent\generated-documents\scope-management\work-performance-information-scope.md" --folderUrl "https://cbadmin.sharepoint.com/sites/RequirementsGatheringAgent/Gedeelde documenten/scope-management"

    # Stakeholder management folder
    Write-Host "`n--- Uploading stakeholder-management folder ---" -ForegroundColor Magenta

    $fileCount++; Show-Progress $fileCount $totalFiles "stakeholder-analysis.md"
    m365 file add --filePath "C:\Users\menno\Source\Repos\requirements-gathering-agent\generated-documents\stakeholder-management\stakeholder-analysis.md" --folderUrl "https://cbadmin.sharepoint.com/sites/RequirementsGatheringAgent/Gedeelde documenten/stakeholder-management"

    $fileCount++; Show-Progress $fileCount $totalFiles "stakeholder-engagement-plan.md"
    m365 file add --filePath "C:\Users\menno\Source\Repos\requirements-gathering-agent\generated-documents\stakeholder-management\stakeholder-engagement-plan.md" --folderUrl "https://cbadmin.sharepoint.com/sites/RequirementsGatheringAgent/Gedeelde documenten/stakeholder-management"

    $fileCount++; Show-Progress $fileCount $totalFiles "stakeholder-register.md"
    m365 file add --filePath "C:\Users\menno\Source\Repos\requirements-gathering-agent\generated-documents\stakeholder-management\stakeholder-register.md" --folderUrl "https://cbadmin.sharepoint.com/sites/RequirementsGatheringAgent/Gedeelde documenten/stakeholder-management"

    # Strategic statements folder
    Write-Host "`n--- Uploading strategic-statements folder ---" -ForegroundColor Magenta

    $fileCount++; Show-Progress $fileCount $totalFiles "company-values.md"
    m365 file add --filePath "C:\Users\menno\Source\Repos\requirements-gathering-agent\generated-documents\strategic-statements\company-values.md" --folderUrl "https://cbadmin.sharepoint.com/sites/RequirementsGatheringAgent/Gedeelde documenten/strategic-statements"

    $fileCount++; Show-Progress $fileCount $totalFiles "mission-vision-core-values.md"
    m365 file add --filePath "C:\Users\menno\Source\Repos\requirements-gathering-agent\generated-documents\strategic-statements\mission-vision-core-values.md" --folderUrl "https://cbadmin.sharepoint.com/sites/RequirementsGatheringAgent/Gedeelde documenten/strategic-statements"

    $fileCount++; Show-Progress $fileCount $totalFiles "project-purpose.md"
    m365 file add --filePath "C:\Users\menno\Source\Repos\requirements-gathering-agent\generated-documents\strategic-statements\project-purpose.md" --folderUrl "https://cbadmin.sharepoint.com/sites/RequirementsGatheringAgent/Gedeelde documenten/strategic-statements"

    $fileCount++; Show-Progress $fileCount $totalFiles "purpose-statement.md"
    m365 file add --filePath "C:\Users\menno\Source\Repos\requirements-gathering-agent\generated-documents\strategic-statements\purpose-statement.md" --folderUrl "https://cbadmin.sharepoint.com/sites/RequirementsGatheringAgent/Gedeelde documenten/strategic-statements"

    $fileCount++; Show-Progress $fileCount $totalFiles "strategic-business-case.md"
    m365 file add --filePath "C:\Users\menno\Source\Repos\requirements-gathering-agent\generated-documents\strategic-statements\strategic-business-case.md" --folderUrl "https://cbadmin.sharepoint.com/sites/RequirementsGatheringAgent/Gedeelde documenten/strategic-statements"

    # Technical analysis folder
    Write-Host "`n--- Uploading technical-analysis folder ---" -ForegroundColor Magenta

    $fileCount++; Show-Progress $fileCount $totalFiles "acceptance-criteria.md"
    m365 file add --filePath "C:\Users\menno\Source\Repos\requirements-gathering-agent\generated-documents\technical-analysis\acceptance-criteria.md" --folderUrl "https://cbadmin.sharepoint.com/sites/RequirementsGatheringAgent/Gedeelde documenten/technical-analysis"

    $fileCount++; Show-Progress $fileCount $totalFiles "compliance-considerations.md"
    m365 file add --filePath "C:\Users\menno\Source\Repos\requirements-gathering-agent\generated-documents\technical-analysis\compliance-considerations.md" --folderUrl "https://cbadmin.sharepoint.com/sites/RequirementsGatheringAgent/Gedeelde documenten/technical-analysis"

    $fileCount++; Show-Progress $fileCount $totalFiles "data-model-suggestions.md"
    m365 file add --filePath "C:\Users\menno\Source\Repos\requirements-gathering-agent\generated-documents\technical-analysis\data-model-suggestions.md" --folderUrl "https://cbadmin.sharepoint.com/sites/RequirementsGatheringAgent/Gedeelde documenten/technical-analysis"

    $fileCount++; Show-Progress $fileCount $totalFiles "risk-analysis.md"
    m365 file add --filePath "C:\Users\menno\Source\Repos\requirements-gathering-agent\generated-documents\technical-analysis\risk-analysis.md" --folderUrl "https://cbadmin.sharepoint.com/sites/RequirementsGatheringAgent/Gedeelde documenten/technical-analysis"

    $fileCount++; Show-Progress $fileCount $totalFiles "tech-stack-analysis.md"
    m365 file add --filePath "C:\Users\menno\Source\Repos\requirements-gathering-agent\generated-documents\technical-analysis\tech-stack-analysis.md" --folderUrl "https://cbadmin.sharepoint.com/sites/RequirementsGatheringAgent/Gedeelde documenten/technical-analysis"

    $fileCount++; Show-Progress $fileCount $totalFiles "ui-ux-considerations.md"
    m365 file add --filePath "C:\Users\menno\Source\Repos\requirements-gathering-agent\generated-documents\technical-analysis\ui-ux-considerations.md" --folderUrl "https://cbadmin.sharepoint.com/sites/RequirementsGatheringAgent/Gedeelde documenten/technical-analysis"

    # Technical design folder
    Write-Host "`n--- Uploading technical-design folder ---" -ForegroundColor Magenta

    $fileCount++; Show-Progress $fileCount $totalFiles "apidocumentation.md"
    m365 file add --filePath "C:\Users\menno\Source\Repos\requirements-gathering-agent\generated-documents\technical-design\apidocumentation.md" --folderUrl "https://cbadmin.sharepoint.com/sites/RequirementsGatheringAgent/Gedeelde documenten/technical-design"

    $fileCount++; Show-Progress $fileCount $totalFiles "architecture-design.md"
    m365 file add --filePath "C:\Users\menno\Source\Repos\requirements-gathering-agent\generated-documents\technical-design\architecture-design.md" --folderUrl "https://cbadmin.sharepoint.com/sites/RequirementsGatheringAgent/Gedeelde documenten/technical-design"

    $fileCount++; Show-Progress $fileCount $totalFiles "database-schema.md"
    m365 file add --filePath "C:\Users\menno\Source\Repos\requirements-gathering-agent\generated-documents\technical-design\database-schema.md" --folderUrl "https://cbadmin.sharepoint.com/sites/RequirementsGatheringAgent/Gedeelde documenten/technical-design"

    $fileCount++; Show-Progress $fileCount $totalFiles "deployment-architecture.md"
    m365 file add --filePath "C:\Users\menno\Source\Repos\requirements-gathering-agent\generated-documents\technical-design\deployment-architecture.md" --folderUrl "https://cbadmin.sharepoint.com/sites/RequirementsGatheringAgent/Gedeelde documenten/technical-design"

    $fileCount++; Show-Progress $fileCount $totalFiles "error-handling.md"
    m365 file add --filePath "C:\Users\menno\Source\Repos\requirements-gathering-agent\generated-documents\technical-design\error-handling.md" --folderUrl "https://cbadmin.sharepoint.com/sites/RequirementsGatheringAgent/Gedeelde documenten/technical-design"

    $fileCount++; Show-Progress $fileCount $totalFiles "integration-design.md"
    m365 file add --filePath "C:\Users\menno\Source\Repos\requirements-gathering-agent\generated-documents\technical-design\integration-design.md" --folderUrl "https://cbadmin.sharepoint.com/sites/RequirementsGatheringAgent/Gedeelde documenten/technical-design"

    $fileCount++; Show-Progress $fileCount $totalFiles "performance-requirements.md"
    m365 file add --filePath "C:\Users\menno\Source\Repos\requirements-gathering-agent\generated-documents\technical-design\performance-requirements.md" --folderUrl "https://cbadmin.sharepoint.com/sites/RequirementsGatheringAgent/Gedeelde documenten/technical-design"

    $fileCount++; Show-Progress $fileCount $totalFiles "security-design.md"
    m365 file add --filePath "C:\Users\menno\Source\Repos\requirements-gathering-agent\generated-documents\technical-design\security-design.md" --folderUrl "https://cbadmin.sharepoint.com/sites/RequirementsGatheringAgent/Gedeelde documenten/technical-design"

    $fileCount++; Show-Progress $fileCount $totalFiles "system-design.md"
    m365 file add --filePath "C:\Users\menno\Source\Repos\requirements-gathering-agent\generated-documents\technical-design\system-design.md" --folderUrl "https://cbadmin.sharepoint.com/sites/RequirementsGatheringAgent/Gedeelde documenten/technical-design"

    $fileCount++; Show-Progress $fileCount $totalFiles "technical-stack.md"
    m365 file add --filePath "C:\Users\menno\Source\Repos\requirements-gathering-agent\generated-documents\technical-design\technical-stack.md" --folderUrl "https://cbadmin.sharepoint.com/sites/RequirementsGatheringAgent/Gedeelde documenten/technical-design"

    Write-Host "`n✅ Upload process completed successfully!" -ForegroundColor Green
    Write-Host "Total files uploaded: $fileCount" -ForegroundColor Yellow
    Write-Host "All documents have been uploaded to SharePoint with proper folder structure." -ForegroundColor Green

} catch {
    Write-Host "❌ Error occurred during upload process:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host "`nProgress: $fileCount out of $totalFiles files processed" -ForegroundColor Yellow
}

Write-Host "`nScript execution completed." -ForegroundColor White
