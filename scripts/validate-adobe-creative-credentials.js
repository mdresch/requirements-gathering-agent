#!/usr/bin/env node

/**
 * Adobe Creative Suite API Credentials Validation Script
 * 
 * This script validates the Adobe Creative Suite API credentials configured in
 * the .env.adobe.creative file and tests connectivity to all required APIs.
 */

import { creativeSuiteAuth } from '../src/adobe/creative-suite/authenticator.js';
import { creativeSuiteConfig } from '../src/adobe/creative-suite/config.js';
import chalk from 'chalk';

// Helper for console styling
const style = {
    header: (text) => console.log(chalk.bold.blue(`\n===== ${text} =====`)),
    success: (text) => console.log(chalk.green(`✓ ${text}`)),
    error: (text) => console.log(chalk.red(`✗ ${text}`)),
    warning: (text) => console.log(chalk.yellow(`⚠ ${text}`)),
    info: (text) => console.log(chalk.cyan(`ℹ ${text}`)),
    detail: (text) => console.log(`  ${text}`)
};

/**
 * Validate configuration and existence of required files
 */
async function validateConfiguration() {
    style.header('Configuration Validation');

    try {
        const configResult = creativeSuiteConfig.validateConfiguration();

        if (configResult.isValid) {
            style.success('Configuration is valid');
            return true;
        } else {
            if (configResult.errors.length > 0) {
                style.error('Configuration errors:');
                configResult.errors.forEach(err => style.detail(err));
            }

            if (configResult.warnings.length > 0) {
                style.warning('Configuration warnings:');
                configResult.warnings.forEach(warn => style.detail(warn));
            }
            
            return configResult.errors.length === 0;
        }
    } catch (error) {
        style.error(`Failed to validate configuration: ${error.message}`);
        return false;
    }
}

/**
 * Check if API credentials are configured
 */
async function checkCredentials() {
    style.header('API Credential Check');

    try {
        const config = creativeSuiteConfig.getConfig();
        let hasAllCredentials = true;

        // Check client ID
        if (!config.authentication.clientId || config.authentication.clientId === 'your_creative_client_id_here') {
            style.error('Client ID is missing or using default value');
            style.detail(`Current value: "${config.authentication.clientId}"`);
            hasAllCredentials = false;
        } else {
            style.success('Client ID is configured');
        }

        // Check client secret
        if (!config.authentication.clientSecret || config.authentication.clientSecret === 'your_creative_client_secret_here') {
            style.error('Client Secret is missing or using default value');
            style.detail(`Current value: "${config.authentication.clientSecret}"`);
            hasAllCredentials = false;
        } else {
            style.success('Client Secret is configured');
        }

        // Check scopes
        if (!config.authentication.scopes || config.authentication.scopes.length === 0) {
            style.error('API scopes are not configured');
            hasAllCredentials = false;
        } else {
            style.success(`API scopes are configured (${config.authentication.scopes.length} scopes)`);
            style.detail(config.authentication.scopes.join(', '));
        }

        // Check API endpoints
        style.info('Checking API endpoints:');
        const apis = {
            'InDesign': config.apis.indesign.endpoint,
            'Illustrator': config.apis.illustrator.endpoint,
            'Photoshop': config.apis.photoshop.endpoint,
            'Document Generation': config.apis.documentGeneration.endpoint
        };

        for (const [name, endpoint] of Object.entries(apis)) {
            if (!endpoint || endpoint === 'https://api.adobe.io/indesign/v1') {
                style.warning(`${name} API endpoint is using default value: ${endpoint}`);
            } else {
                style.success(`${name} API endpoint is configured: ${endpoint}`);
            }
        }

        return hasAllCredentials;
    } catch (error) {
        style.error(`Failed to check credentials: ${error.message}`);
        return false;
    }
}

/**
 * Test authentication with Adobe APIs
 */
async function testAuthentication() {
    style.header('Authentication Test');

    try {
        const authResult = await creativeSuiteAuth.validateAuthentication();

        if (authResult.isAuthenticated) {
            style.success('Authentication successful');
            
            if (authResult.tokenInfo) {
                style.info('Token Information:');
                style.detail(`Expires: ${authResult.tokenInfo.expiresAt.toLocaleString()}`);
                style.detail(`Token Type: ${authResult.tokenInfo.tokenType}`);
                style.detail(`Scopes: ${authResult.tokenInfo.scopes.join(', ')}`);
            }
            
            return true;
        } else {
            style.error(`Authentication failed: ${authResult.error || 'Unknown error'}`);
            return false;
        }
    } catch (error) {
        style.error(`Authentication test error: ${error.message}`);
        return false;
    }
}

/**
 * Test connectivity to all API endpoints
 */
async function testAPIConnectivity() {
    style.header('API Connectivity Test');

    try {
        const connectivityResult = await creativeSuiteAuth.testAPIConnectivity();

        if (connectivityResult.allAPIsConnected) {
            style.success('All APIs connected successfully');
        } else {
            style.warning('Some APIs failed to connect');
        }

        // Display individual API status
        style.info('Individual API Status:');
        for (const [api, connected] of Object.entries(connectivityResult.apiStatus)) {
            if (connected) {
                style.success(`${api}: Connected`);
            } else {
                style.error(`${api}: Failed to connect`);
            }
        }

        // Display any error message
        if (connectivityResult.error) {
            style.error(`Error: ${connectivityResult.error}`);
        }

        return connectivityResult.allAPIsConnected;
    } catch (error) {
        style.error(`API connectivity test error: ${error.message}`);
        return false;
    }
}

/**
 * Display validation summary
 */
function displaySummary(configValid, credentialsConfigured, authValid, connectivityValid) {
    style.header('Validation Summary');

    const results = {
        'Configuration': configValid,
        'Credentials': credentialsConfigured,
        'Authentication': authValid,
        'API Connectivity': connectivityValid
    };

    for (const [test, passed] of Object.entries(results)) {
        if (passed) {
            style.success(`${test}: Passed`);
        } else {
            style.error(`${test}: Failed`);
        }
    }

    const allPassed = Object.values(results).every(result => result);
    
    if (allPassed) {
        style.header('All Validations Passed');
        style.success('Your Adobe Creative Suite API credentials are correctly configured and working!');
        style.info('\nNext Steps:');
        style.detail('1. Run template test: npm run adobe:phase2:templates');
        style.detail('2. Run capability check: npm run adobe:phase2:capabilities');
        style.detail('3. Run demo: npm run adobe:phase2:demo');
    } else {
        style.header('Some Validations Failed');
        style.warning('Please review the errors above and fix your configuration.');
        style.info('\nTroubleshooting Tips:');
        style.detail('1. Ensure .env.adobe.creative exists with correct credentials');
        style.detail('2. Verify Adobe Developer Console project is correctly set up');
        style.detail('3. Check that required API scopes are enabled');
        style.detail('4. Verify your Adobe subscription includes the required APIs');
        style.detail('5. See docs/ADOBE/API-CREDENTIAL-SETUP.md for detailed setup instructions');
    }
}

/**
 * Main validation function
 */
async function validateCreativeCredentials() {
    console.log(chalk.bold.magenta('\n================================================='));
    console.log(chalk.bold.magenta('  Adobe Creative Suite API Credential Validation'));
    console.log(chalk.bold.magenta('=================================================\n'));

    try {
        // Step 1: Validate configuration
        const configValid = await validateConfiguration();
        
        // Step 2: Check if credentials are configured
        const credentialsConfigured = await checkCredentials();
        
        // Step 3: Test authentication (only if credentials are configured)
        const authValid = credentialsConfigured ? await testAuthentication() : false;
        
        // Step 4: Test API connectivity (only if authentication is valid)
        const connectivityValid = authValid ? await testAPIConnectivity() : false;
        
        // Step 5: Display summary
        displaySummary(configValid, credentialsConfigured, authValid, connectivityValid);
        
    } catch (error) {
        style.error(`Validation failed with error: ${error.message}`);
        process.exit(1);
    }
}

// Run the validation
validateCreativeCredentials().catch(error => {
    console.error(`Unexpected error during validation: ${error.message}`);
    process.exit(1);
});
