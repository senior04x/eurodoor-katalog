# Eurodoor Production Deployment Script (Windows)
# This script ensures zero-downtime deployment with proper validation

param(
    [string]$Environment = "production",
    [switch]$SkipTests = $false,
    [switch]$SkipBackup = $false
)

# Configuration
$APP_NAME = "eurodoor"
$BUILD_DIR = "build"
$BACKUP_DIR = "backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"

# Function to print colored output
function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Pre-deployment checks
Write-Status "Running pre-deployment checks..."

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Error "package.json not found. Are you in the project root?"
    exit 1
}

# Check if environment variables are set
if (-not $env:VITE_SUPABASE_URL) {
    Write-Warning "VITE_SUPABASE_URL not set. Using default."
}

if (-not $env:VITE_VAPID_PUBLIC_KEY) {
    Write-Warning "VITE_VAPID_PUBLIC_KEY not set. Push notifications may not work."
}

# Install dependencies
Write-Status "Installing dependencies..."
npm ci --only=production

# Run tests (unless skipped)
if (-not $SkipTests) {
    Write-Status "Running tests..."
    npm run test -- --run
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Tests failed. Deployment aborted."
        exit 1
    }
}

# Run linting
Write-Status "Running linting..."
npm run lint

if ($LASTEXITCODE -ne 0) {
    Write-Error "Linting failed. Deployment aborted."
    exit 1
}

# Type checking
Write-Status "Running type checking..."
npm run type-check

if ($LASTEXITCODE -ne 0) {
    Write-Error "Type checking failed. Deployment aborted."
    exit 1
}

# Build the application
Write-Status "Building application..."
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Error "Build failed. Deployment aborted."
    exit 1
}

# Verify build
if (-not (Test-Path $BUILD_DIR)) {
    Write-Error "Build directory not found. Build failed."
    exit 1
}

Write-Success "Build completed successfully!"

# Check bundle sizes
Write-Status "Checking bundle sizes..."
$BundleSize = (Get-ChildItem $BUILD_DIR -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
Write-Status "Bundle size: $([math]::Round($BundleSize, 2)) MB"

# Check for large files
$LargeFiles = Get-ChildItem $BUILD_DIR -Recurse -Include "*.js" | Where-Object { $_.Length -gt 500KB }
if ($LargeFiles) {
    Write-Warning "Large files detected:"
    $LargeFiles | ForEach-Object { Write-Host "  $($_.FullName): $([math]::Round($_.Length / 1KB, 2)) KB" }
}

# Create backup of current deployment (if exists and not skipped)
if (-not $SkipBackup -and (Test-Path "C:\inetpub\wwwroot\$APP_NAME")) {
    Write-Status "Creating backup of current deployment..."
    Copy-Item "C:\inetpub\wwwroot\$APP_NAME" "C:\inetpub\wwwroot\$BACKUP_DIR" -Recurse
    Write-Success "Backup created at C:\inetpub\wwwroot\$BACKUP_DIR"
}

# Deploy to production
Write-Status "Deploying to production..."
if (Test-Path "C:\inetpub\wwwroot\$APP_NAME") {
    Remove-Item "C:\inetpub\wwwroot\$APP_NAME" -Recurse -Force
}
Copy-Item $BUILD_DIR "C:\inetpub\wwwroot\$APP_NAME" -Recurse

# Health check
Write-Status "Performing health check..."
Start-Sleep -Seconds 5

$HealthCheckUrl = "https://eurodoor.uz"
try {
    $Response = Invoke-WebRequest -Uri $HealthCheckUrl -UseBasicParsing -TimeoutSec 30
    if ($Response.StatusCode -eq 200) {
        Write-Success "Health check passed! Application is running."
    } else {
        Write-Error "Health check failed! HTTP Status: $($Response.StatusCode)"
        if (-not $SkipBackup) {
            Write-Status "Rolling back to previous version..."
            Remove-Item "C:\inetpub\wwwroot\$APP_NAME" -Recurse -Force
            Move-Item "C:\inetpub\wwwroot\$BACKUP_DIR" "C:\inetpub\wwwroot\$APP_NAME"
        }
        exit 1
    }
} catch {
    Write-Error "Health check failed! Error: $($_.Exception.Message)"
    if (-not $SkipBackup) {
        Write-Status "Rolling back to previous version..."
        Remove-Item "C:\inetpub\wwwroot\$APP_NAME" -Recurse -Force
        Move-Item "C:\inetpub\wwwroot\$BACKUP_DIR" "C:\inetpub\wwwroot\$APP_NAME"
    }
    exit 1
}

# Cleanup old backups (keep last 5)
Write-Status "Cleaning up old backups..."
$OldBackups = Get-ChildItem "C:\inetpub\wwwroot" -Directory | Where-Object { $_.Name -like "backup-*" } | Sort-Object CreationTime -Descending | Select-Object -Skip 5
$OldBackups | ForEach-Object { Remove-Item $_.FullName -Recurse -Force }

Write-Success "🎉 Deployment completed successfully!"
Write-Status "Application is now live at: $HealthCheckUrl"
Write-Status "Bundle size: $([math]::Round($BundleSize, 2)) MB"

# Send notification (optional)
if ($env:SLACK_WEBHOOK_URL) {
    $Body = @{
        text = "🚀 Eurodoor deployment successful! Bundle size: $([math]::Round($BundleSize, 2)) MB"
    } | ConvertTo-Json
    
    try {
        Invoke-RestMethod -Uri $env:SLACK_WEBHOOK_URL -Method Post -Body $Body -ContentType "application/json"
    } catch {
        Write-Warning "Failed to send Slack notification: $($_.Exception.Message)"
    }
}

Write-Status "Deployment completed at $(Get-Date)"
