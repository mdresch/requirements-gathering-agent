#!/usr/bin/env pwsh
# TypeScript compilation test for Adobe integration

Write-Host "Testing Adobe Integration TypeScript Compilation" -ForegroundColor Yellow
Write-Host "=" * 60

$projectRoot = Get-Location
$adobeFiles = @(
    "src/adobe/types.ts",
    "src/adobe/config.ts", 
    "src/utils/circuit-breaker.ts",
    "src/utils/rate-limiter.ts",
    "src/utils/logger.ts",
    "src/adobe/pdf-processor.ts",
    "src/adobe/document-intelligence.ts",
    "src/adobe/brand-compliance.ts",
    "src/adobe/enhanced-adpa-processor.ts",
    "src/adobe/index.ts"
)

$passed = 0
$failed = 0

foreach ($file in $adobeFiles) {
    $filePath = Join-Path $projectRoot $file
    if (Test-Path $filePath) {
        Write-Host "Checking: $file" -ForegroundColor Cyan
        
        # Test TypeScript compilation for this specific file
        $result = & npx tsc --noEmit --target ES2020 --module ESNext --moduleResolution node --strict $filePath 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   Compiled successfully" -ForegroundColor Green
            $passed++
        } else {
            Write-Host "   Compilation failed:" -ForegroundColor Red
            Write-Host "   $result" -ForegroundColor Red
            $failed++
        }
    } else {
        Write-Host "File not found: $file" -ForegroundColor Red
        $failed++
    }
}

Write-Host ""
Write-Host "TypeScript Compilation Summary" -ForegroundColor Yellow
Write-Host "=" * 60
Write-Host "Passed: $passed" -ForegroundColor Green
Write-Host "Failed: $failed" -ForegroundColor Red

if ($failed -eq 0) {
    Write-Host ""
    Write-Host "All Adobe TypeScript files compile successfully!" -ForegroundColor Green
    Write-Host "Adobe Integration Phase 1 is ready for use." -ForegroundColor Green
    exit 0
} else {
    Write-Host ""
    Write-Host "Some TypeScript files have compilation issues." -ForegroundColor Yellow
    Write-Host "This may be due to missing dependencies or type definitions." -ForegroundColor Yellow
    exit 1
}
