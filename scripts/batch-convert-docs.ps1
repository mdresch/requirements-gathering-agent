# Batch PDF Conversion for Generated Documents
# PowerShell script to convert all markdown and text files to PDF

param(
    [string]$InputDir = ".\generated-documents",
    [string]$OutputDir = ".\generated-documents-pdf",
    [int]$Concurrency = 2,
    [switch]$Force,
    [switch]$Verbose
)

# Configuration
$Config = @{
    SupportedExtensions = @('.md', '.txt', '.html')
    NodeScript = ".\scripts\simple-batch-pdf-converter.js"
    RequiredPackages = @('puppeteer', 'marked')
}

# Logging functions
function Write-Log {
    param([string]$Level, [string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$Level] $timestamp - $Message" -ForegroundColor $(
        switch ($Level) {
            'INFO' { 'White' }
            'SUCCESS' { 'Green' }
            'WARN' { 'Yellow' }
            'ERROR' { 'Red' }
            default { 'White' }
        }
    )
}

function Test-Prerequisites {
    Write-Log "INFO" "Checking prerequisites..."
    
    # Check Node.js
    try {
        $nodeVersion = node --version 2>$null
        if ($nodeVersion) {
            Write-Log "SUCCESS" "Node.js found: $nodeVersion"
        } else {
            Write-Log "ERROR" "Node.js not found. Please install Node.js from https://nodejs.org/"
            return $false
        }
    } catch {
        Write-Log "ERROR" "Node.js not found. Please install Node.js from https://nodejs.org/"
        return $false
    }
    
    # Check npm packages
    $packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
    $installedPackages = $packageJson.dependencies.PSObject.Properties.Name
    
    foreach ($package in $Config.RequiredPackages) {
        if ($package -in $installedPackages) {
            Write-Log "SUCCESS" "Package '$package' found in dependencies"
        } else {
            Write-Log "WARN" "Package '$package' not found. Installing..."
            try {
                npm install $package --save
                Write-Log "SUCCESS" "Installed package '$package'"
            } catch {
                Write-Log "ERROR" "Failed to install package '$package'"
                return $false
            }
        }
    }
    
    return $true
}

function Get-FileStats {
    param([string]$Directory)
    
    if (-not (Test-Path $Directory)) {
        Write-Log "WARN" "Directory '$Directory' not found"
        return @{ Total = 0; Files = @() }
    }
    
    $files = Get-ChildItem -Path $Directory -Recurse -File | Where-Object {
        $Config.SupportedExtensions -contains $_.Extension.ToLower()
    }
    
    $stats = @{
        Total = $files.Count
        Files = $files
        ByExtension = $files | Group-Object Extension | ForEach-Object {
            @{ Extension = $_.Name; Count = $_.Count }
        }
    }
    
    return $stats
}

function Start-BatchConversion {
    param([string]$InputDir, [string]$OutputDir)
    
    Write-Log "INFO" "Starting batch PDF conversion..."
    Write-Log "INFO" "Input directory: $InputDir"
    Write-Log "INFO" "Output directory: $OutputDir"
    
    # Create output directory
    if (-not (Test-Path $OutputDir)) {
        New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
        Write-Log "INFO" "Created output directory: $OutputDir"
    }
    
    # Check if Node.js script exists
    if (-not (Test-Path $Config.NodeScript)) {
        Write-Log "ERROR" "Node.js conversion script not found: $($Config.NodeScript)"
        return $false
    }
    
    # Set environment variables for the Node.js script
    $env:INPUT_DIR = $InputDir
    $env:OUTPUT_DIR = $OutputDir
    $env:CONCURRENCY = $Concurrency
    if ($Force) { $env:FORCE_OVERWRITE = "true" }
    if ($Verbose) { $env:VERBOSE = "true" }
    
    try {
        # Run the Node.js conversion script
        Write-Log "INFO" "Executing Node.js conversion script..."
        $process = Start-Process -FilePath "node" -ArgumentList $Config.NodeScript -Wait -PassThru -NoNewWindow
        
        if ($process.ExitCode -eq 0) {
            Write-Log "SUCCESS" "Batch conversion completed successfully"
            return $true
        } else {
            Write-Log "ERROR" "Batch conversion failed with exit code: $($process.ExitCode)"
            return $false
        }
    } catch {
        Write-Log "ERROR" "Failed to execute conversion script: $($_.Exception.Message)"
        return $false
    }
}

function Show-Summary {
    param([string]$OutputDir)
    
    if (-not (Test-Path $OutputDir)) {
        Write-Log "WARN" "Output directory not found for summary"
        return
    }
    
    $pdfFiles = Get-ChildItem -Path $OutputDir -Recurse -Filter "*.pdf"
    $totalSize = ($pdfFiles | Measure-Object -Property Length -Sum).Sum
    $avgSize = if ($pdfFiles.Count -gt 0) { $totalSize / $pdfFiles.Count } else { 0 }
    
    Write-Log "INFO" ""
    Write-Log "INFO" "=== CONVERSION SUMMARY ==="
    Write-Log "INFO" "PDF files created: $($pdfFiles.Count)"
    Write-Log "INFO" "Total size: $([math]::Round($totalSize / 1MB, 2)) MB"
    Write-Log "INFO" "Average file size: $([math]::Round($avgSize / 1KB, 2)) KB"
    Write-Log "INFO" "Output location: $OutputDir"
    
    if ($pdfFiles.Count -gt 0) {
        Write-Log "SUCCESS" "Batch conversion completed successfully!"
    }
}

# Main execution
try {
    Write-Host ""
    Write-Host "============================================" -ForegroundColor Cyan
    Write-Host "  Requirements Gathering Agent" -ForegroundColor Cyan
    Write-Host "  Batch PDF Conversion Tool" -ForegroundColor Cyan
    Write-Host "============================================" -ForegroundColor Cyan
    Write-Host ""
    
    # Check prerequisites
    if (-not (Test-Prerequisites)) {
        Write-Log "ERROR" "Prerequisites check failed. Please resolve the issues above."
        exit 1
    }
    
    # Get file statistics
    $stats = Get-FileStats -Directory $InputDir
    
    if ($stats.Total -eq 0) {
        Write-Log "WARN" "No supported files found in '$InputDir'"
        Write-Log "INFO" "Supported extensions: $($Config.SupportedExtensions -join ', ')"
        exit 0
    }
    
    Write-Log "INFO" "Found $($stats.Total) files to convert:"
    foreach ($group in $stats.ByExtension) {
        Write-Log "INFO" "  $($group.Extension): $($group.Count) files"
    }
    
    # Confirm before proceeding (unless Force is specified)
    if (-not $Force) {
        Write-Host ""
        $confirm = Read-Host "Proceed with conversion? (y/N)"
        if ($confirm -ne 'y' -and $confirm -ne 'Y') {
            Write-Log "INFO" "Conversion cancelled by user"
            exit 0
        }
    }
    
    Write-Host ""
    
    # Start conversion
    $success = Start-BatchConversion -InputDir $InputDir -OutputDir $OutputDir
    
    if ($success) {
        Show-Summary -OutputDir $OutputDir
    } else {
        Write-Log "ERROR" "Batch conversion failed. Check the logs above for details."
        exit 1
    }
    
} catch {
    Write-Log "ERROR" "Unexpected error: $($_.Exception.Message)"
    Write-Host $_.Exception.StackTrace -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Conversion Complete" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
