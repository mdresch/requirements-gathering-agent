# Phase 1: Enhanced Data Integration - Database Setup Script
# PowerShell script to set up PostgreSQL database for Phase 1

Write-Host "🚀 Setting up PostgreSQL database for Phase 1 Enhanced Data Integration..." -ForegroundColor Green

# Check if PostgreSQL is installed
$pgPath = Get-Command psql -ErrorAction SilentlyContinue
if (-not $pgPath) {
    Write-Host "❌ PostgreSQL is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install PostgreSQL from: https://www.postgresql.org/download/" -ForegroundColor Yellow
    Write-Host "Or use Docker: docker run --name postgres-phase1 -e POSTGRES_PASSWORD=compliance_password -p 5432:5432 -d postgres:15" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ PostgreSQL found at: $($pgPath.Source)" -ForegroundColor Green

# Database configuration
$DB_HOST = "localhost"
$DB_PORT = "5432"
$DB_NAME = "compliance_db"
$DB_USER = "compliance_user"
$DB_PASSWORD = "compliance_password"

Write-Host "📊 Database Configuration:" -ForegroundColor Cyan
Write-Host "  Host: $DB_HOST" -ForegroundColor White
Write-Host "  Port: $DB_PORT" -ForegroundColor White
Write-Host "  Database: $DB_NAME" -ForegroundColor White
Write-Host "  User: $DB_USER" -ForegroundColor White
Write-Host "  Password: $DB_PASSWORD" -ForegroundColor White

# Test connection to PostgreSQL server
Write-Host "`n🔍 Testing PostgreSQL server connection..." -ForegroundColor Yellow
try {
    $testResult = psql -h $DB_HOST -p $DB_PORT -U postgres -d postgres -c "SELECT version();" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ PostgreSQL server is running" -ForegroundColor Green
    } else {
        Write-Host "❌ Cannot connect to PostgreSQL server" -ForegroundColor Red
        Write-Host "Error: $testResult" -ForegroundColor Red
        Write-Host "`nPlease ensure PostgreSQL is running and accessible" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "❌ Error testing PostgreSQL connection: $_" -ForegroundColor Red
    exit 1
}

# Create database and user
Write-Host "`n🔨 Creating database and user..." -ForegroundColor Yellow

# Create database
Write-Host "Creating database: $DB_NAME" -ForegroundColor White
$createDbResult = psql -h $DB_HOST -p $DB_PORT -U postgres -d postgres -c "CREATE DATABASE $DB_NAME;" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Database '$DB_NAME' created successfully" -ForegroundColor Green
} else {
    if ($createDbResult -match "already exists") {
        Write-Host "ℹ️ Database '$DB_NAME' already exists" -ForegroundColor Blue
    } else {
        Write-Host "❌ Error creating database: $createDbResult" -ForegroundColor Red
        exit 1
    }
}

# Create user
Write-Host "Creating user: $DB_USER" -ForegroundColor White
$createUserResult = psql -h $DB_HOST -p $DB_PORT -U postgres -d postgres -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ User '$DB_USER' created successfully" -ForegroundColor Green
} else {
    if ($createUserResult -match "already exists") {
        Write-Host "ℹ️ User '$DB_USER' already exists" -ForegroundColor Blue
    } else {
        Write-Host "❌ Error creating user: $createUserResult" -ForegroundColor Red
        exit 1
    }
}

# Grant privileges
Write-Host "Granting privileges to user..." -ForegroundColor White
$grantResult = psql -h $DB_HOST -p $DB_PORT -U postgres -d postgres -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Privileges granted successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Error granting privileges: $grantResult" -ForegroundColor Red
    exit 1
}

# Test the new connection
Write-Host "`n🔍 Testing new database connection..." -ForegroundColor Yellow
$testNewConnection = psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT 'Connection successful' as status;" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Database connection test successful" -ForegroundColor Green
} else {
    Write-Host "❌ Database connection test failed: $testNewConnection" -ForegroundColor Red
    exit 1
}

Write-Host "`n🎉 Database setup completed successfully!" -ForegroundColor Green
Write-Host "You can now start the Phase 1 server with: npm run api:enhanced" -ForegroundColor Cyan
