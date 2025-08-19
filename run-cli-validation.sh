#!/bin/bash

# CLI Validation Script
# Comprehensive validation of CLI functionality for release readiness

set -e

echo "🧪 ADPA CLI Validation Suite"
echo "=================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to run a test
run_test() {
    local test_name="$1"
    local test_command="$2"
    local expected_success="$3"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    echo -n "🧪 $test_name: "
    
    if eval "$test_command" >/dev/null 2>&1; then
        if [ "$expected_success" = "true" ]; then
            echo -e "${GREEN}✅ PASSED${NC}"
            PASSED_TESTS=$((PASSED_TESTS + 1))
        else
            echo -e "${RED}❌ FAILED (should have failed)${NC}"
            FAILED_TESTS=$((FAILED_TESTS + 1))
        fi
    else
        if [ "$expected_success" = "false" ]; then
            echo -e "${GREEN}✅ PASSED (failed as expected)${NC}"
            PASSED_TESTS=$((PASSED_TESTS + 1))
        else
            echo -e "${RED}❌ FAILED${NC}"
            FAILED_TESTS=$((FAILED_TESTS + 1))
        fi
    fi
}

# Function to check if CLI is available
check_cli_availability() {
    echo "🔍 Checking CLI availability..."
    
    if [ ! -f "dist/cli.js" ]; then
        echo -e "${YELLOW}⚠️  CLI not built. Attempting to build...${NC}"
        if npm run build >/dev/null 2>&1; then
            echo -e "${GREEN}✅ Build successful${NC}"
        else
            echo -e "${RED}❌ Build failed. Please run 'npm install && npm run build' first${NC}"
            exit 1
        fi
    else
        echo -e "${GREEN}✅ CLI found${NC}"
    fi
}

# Function to check dependencies
check_dependencies() {
    echo "📦 Checking dependencies..."
    
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}⚠️  Dependencies not installed. Attempting to install...${NC}"
        if npm install >/dev/null 2>&1; then
            echo -e "${GREEN}✅ Dependencies installed${NC}"
        else
            echo -e "${YELLOW}⚠️  Could not install dependencies. Some tests may fail.${NC}"
        fi
    else
        echo -e "${GREEN}✅ Dependencies found${NC}"
    fi
}

# Function to run basic CLI tests
run_basic_tests() {
    echo ""
    echo "📋 Running Basic CLI Tests..."
    echo "-----------------------------"
    
    run_test "CLI Help Display" "node dist/cli.js --help | grep -q 'Commands:'" "true"
    run_test "CLI Version Display" "node dist/cli.js --version | grep -E '[0-9]+\.[0-9]+\.[0-9]+'" "true"
    run_test "Generate Help" "node dist/cli.js generate --help | grep -q 'Generate a specific document'" "true"
    run_test "Confluence Help" "node dist/cli.js confluence --help | grep -q 'Confluence integration'" "true"
    run_test "SharePoint Help" "node dist/cli.js sharepoint --help | grep -q 'SharePoint integration'" "true"
    run_test "VCS Help" "node dist/cli.js vcs --help | grep -q 'Version control system'" "true"
}

# Function to run error handling tests
run_error_tests() {
    echo ""
    echo "🚨 Running Error Handling Tests..."
    echo "----------------------------------"
    
    run_test "Unknown Command Error" "node dist/cli.js unknown-command" "false"
    run_test "Invalid Parameters" "node dist/cli.js generate --retries -1" "false"
    run_test "Missing Required Params" "node dist/cli.js generate" "false"
}

# Function to run Jest tests if available
run_jest_tests() {
    echo ""
    echo "🧪 Running Jest Test Suite..."
    echo "-----------------------------"
    
    if command -v jest >/dev/null 2>&1 || [ -f "node_modules/.bin/jest" ]; then
        echo "Running CLI-specific tests..."
        
        # Try to run our CLI tests
        if npm test -- tests/cli/ >/dev/null 2>&1; then
            echo -e "${GREEN}✅ Jest CLI tests passed${NC}"
            PASSED_TESTS=$((PASSED_TESTS + 1))
        else
            echo -e "${YELLOW}⚠️  Jest CLI tests had issues (may be due to missing dependencies)${NC}"
            FAILED_TESTS=$((FAILED_TESTS + 1))
        fi
        TOTAL_TESTS=$((TOTAL_TESTS + 1))
        
        # Try to run existing integration tests
        if npm test -- tests/integration/cli.test.ts >/dev/null 2>&1; then
            echo -e "${GREEN}✅ Integration tests passed${NC}"
            PASSED_TESTS=$((PASSED_TESTS + 1))
        else
            echo -e "${YELLOW}⚠️  Integration tests had issues${NC}"
            FAILED_TESTS=$((FAILED_TESTS + 1))
        fi
        TOTAL_TESTS=$((TOTAL_TESTS + 1))
    else
        echo -e "${YELLOW}⚠️  Jest not available, skipping automated tests${NC}"
    fi
}

# Function to validate test files
validate_test_files() {
    echo ""
    echo "📁 Validating Test Files..."
    echo "---------------------------"
    
    local test_files=(
        "tests/cli/enhanced-menu-navigation.test.ts"
        "tests/cli/interactive-menu-system.test.ts"
        "tests/cli/cli-integration.test.ts"
        "tests/cli/command-validation.test.ts"
        "tests/integration/cli.test.ts"
    )
    
    for test_file in "${test_files[@]}"; do
        if [ -f "$test_file" ]; then
            echo -e "${GREEN}✅ $test_file exists${NC}"
            PASSED_TESTS=$((PASSED_TESTS + 1))
        else
            echo -e "${RED}❌ $test_file missing${NC}"
            FAILED_TESTS=$((FAILED_TESTS + 1))
        fi
        TOTAL_TESTS=$((TOTAL_TESTS + 1))
    done
}

# Function to validate CLI modules
validate_cli_modules() {
    echo ""
    echo "🔧 Validating CLI Modules..."
    echo "----------------------------"
    
    local cli_modules=(
        "src/modules/cli/EnhancedMenuNavigation.ts"
        "src/modules/cli/InteractiveMenuSystem.ts"
        "src/modules/cli/CommandIntegration.ts"
        "src/modules/cli/InputValidationService.ts"
        "src/modules/cli/InteractiveErrorHandler.ts"
    )
    
    for module in "${cli_modules[@]}"; do
        if [ -f "$module" ]; then
            echo -e "${GREEN}✅ $module exists${NC}"
            PASSED_TESTS=$((PASSED_TESTS + 1))
        else
            echo -e "${RED}❌ $module missing${NC}"
            FAILED_TESTS=$((FAILED_TESTS + 1))
        fi
        TOTAL_TESTS=$((TOTAL_TESTS + 1))
    done
}

# Function to generate summary report
generate_summary() {
    echo ""
    echo "📊 Test Results Summary"
    echo "======================="
    echo "Total Tests: $TOTAL_TESTS"
    echo "Passed: $PASSED_TESTS"
    echo "Failed: $FAILED_TESTS"
    
    local success_rate=$((PASSED_TESTS * 100 / TOTAL_TESTS))
    echo "Success Rate: ${success_rate}%"
    
    if [ $FAILED_TESTS -eq 0 ]; then
        echo ""
        echo -e "${GREEN}🎉 All tests passed! CLI is ready for release.${NC}"
        echo -e "${GREEN}✅ RELEASE APPROVED${NC}"
        return 0
    elif [ $success_rate -ge 80 ]; then
        echo ""
        echo -e "${YELLOW}⚠️  Most tests passed. Review failed tests before release.${NC}"
        echo -e "${YELLOW}🔍 REVIEW REQUIRED${NC}"
        return 1
    else
        echo ""
        echo -e "${RED}❌ Many tests failed. Fix issues before release.${NC}"
        echo -e "${RED}🚫 RELEASE NOT APPROVED${NC}"
        return 2
    fi
}

# Main execution
main() {
    echo "Starting CLI validation process..."
    echo ""
    
    # Pre-flight checks
    check_dependencies
    check_cli_availability
    
    # Validate test infrastructure
    validate_test_files
    validate_cli_modules
    
    # Run functional tests
    run_basic_tests
    run_error_tests
    
    # Run automated tests if possible
    run_jest_tests
    
    # Generate final report
    generate_summary
    
    local exit_code=$?
    
    echo ""
    echo "📄 Detailed test report available in: CLI-TEST-VALIDATION-SUMMARY.md"
    echo ""
    
    exit $exit_code
}

# Run main function
main "$@"