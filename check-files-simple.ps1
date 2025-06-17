Write-Host "Checking for missing Processor and Template files..."

$keys = @('test-strategy', 'coding-standards', 'project-summary', 'strategic-business-case')
$missing = @()

foreach ($key in $keys) {
    $pascalCase = ($key -split '-' | ForEach-Object { 
        $_.Substring(0,1).ToUpper() + $_.Substring(1).ToLower() 
    }) -join ''
    
    $processorFile = Get-ChildItem -Recurse -Path "src\modules\documentTemplates" -Filter "*${pascalCase}Processor.ts" -ErrorAction SilentlyContinue
    $templateFile = Get-ChildItem -Recurse -Path "src\modules\documentTemplates" -Filter "*${pascalCase}Template.ts" -ErrorAction SilentlyContinue
    
    if (-not $processorFile) {
        Write-Host "Missing: ${pascalCase}Processor.ts" -ForegroundColor Red
    }
    if (-not $templateFile) {
        Write-Host "Missing: ${pascalCase}Template.ts" -ForegroundColor Red
    }
}
