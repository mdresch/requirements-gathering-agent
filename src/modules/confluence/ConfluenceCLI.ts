/**
 * Confluence Integration CLI Commands
 * Part of ADPA (Automated Document Processing Assistant) v2.1.3
 * 
 * Provides CLI interface for Confluence integration features
 */

import { ConfluencePublisher, createConfluencePublisher } from './ConfluencePublisher.js';
import { ConfluenceConfigManager, createConfluenceConfigManager } from './ConfluenceConfigManager.js';
import { existsSync } from 'fs';
import { join } from 'path';

/**
 * Test Confluence connection and authentication
 */
export async function testConfluenceConnection(): Promise<void> {
    console.log('🔗 Testing Confluence Connection...\n');
    
    try {
        const configManager = createConfluenceConfigManager();
        const config = configManager.getConfluenceConfig();
        
        // Validate configuration
        const validation = configManager.validateConfiguration();
        if (!validation.valid) {
            console.error('❌ Configuration Error:');
            validation.errors.forEach(error => console.error(`   • ${error}`));
            
            if (validation.warnings.length > 0) {
                console.warn('\n⚠️ Warnings:');
                validation.warnings.forEach(warning => console.warn(`   • ${warning}`));
            }
            
            console.log('\n📋 Environment Setup Instructions:');
            console.log(configManager.getEnvironmentSetupInstructions());
            return;
        }

        // Test connection
        const publisher = createConfluencePublisher(config);
        const connectionResult = await publisher.testConnection();
        
        if (connectionResult.success) {
            console.log('✅ Connection Successful!');
            console.log(`   User: ${connectionResult.userInfo.displayName}`);
            console.log(`   Email: ${connectionResult.userInfo.email}`);
            console.log(`   Account ID: ${connectionResult.userInfo.accountId}`);
            
            // Test space access
            const space = await publisher.getSpace();
            if (space) {
                console.log(`\n📁 Space Access Verified:`);
                console.log(`   Space: ${space.name} (${space.key})`);
                console.log(`   Description: ${space.description?.plain?.value || 'No description'}`);
                console.log(`   Homepage: ${space.homepage?.title || 'No homepage'}`);
            } else {
                console.warn(`\n⚠️ Space '${config.spaceKey}' not found or no access`);
            }
            
            // Get publishing statistics
            try {
                const stats = await publisher.getPublishingStats();
                console.log(`\n📊 Publishing Statistics:`);
                console.log(`   Total Pages: ${stats.totalPages}`);
                console.log(`   Last Updated: ${new Date(stats.lastUpdated).toLocaleString()}`);
            } catch (error) {
                console.warn('   Unable to retrieve publishing statistics');
            }
            
        } else {
            console.error('❌ Connection Failed:');
            console.error(`   ${connectionResult.error}`);
            
            // Provide troubleshooting tips
            console.log('\n🔧 Troubleshooting Tips:');
            console.log('   1. Verify your API token is correct and active');
            console.log('   2. Check that your email matches your Atlassian account');
            console.log('   3. Ensure your base URL is correct (https://your-domain.atlassian.net)');
            console.log('   4. Verify you have access to the specified Confluence space');
        }
        
    } catch (error: any) {
        console.error('❌ Unexpected Error:', error.message);
    }
}

/**
 * Initialize Confluence configuration
 */
export async function initConfluenceConfig(): Promise<void> {
    console.log('⚙️ Initializing Confluence Configuration...\n');
    
    try {
        const configManager = createConfluenceConfigManager();
        const result = await configManager.initializeConfiguration();
        
        if (result.success) {
            console.log('✅ Configuration Initialized Successfully!');
            console.log(`   Configuration file: ${result.configPath}`);
            console.log(`   ${result.message}`);
            
            // Show current status
            const status = configManager.getConfigurationStatus();
            console.log('\n📋 Configuration Status:');
            console.log(`   Configured: ${status.configured ? '✅' : '❌'}`);
            console.log(`   Valid: ${status.valid ? '✅' : '❌'}`);
            
            if (status.errors.length > 0) {
                console.log('\n❌ Errors to fix:');
                status.errors.forEach(error => console.log(`   • ${error}`));
            }
            
            if (status.warnings.length > 0) {
                console.log('\n⚠️ Warnings:');
                status.warnings.forEach(warning => console.log(`   • ${warning}`));
            }
            
            // Environment variables status
            console.log('\n🔐 Environment Variables:');
            if (status.envVarsSet.length > 0) {
                console.log('   Set:');
                status.envVarsSet.forEach(envVar => console.log(`     ✅ ${envVar}`));
            }
            
            if (status.envVarsMissing.length > 0) {
                console.log('   Missing:');
                status.envVarsMissing.forEach(envVar => console.log(`     ❌ ${envVar}`));
            }
            
            console.log('\n📋 Next Steps:');
            console.log('   1. Update config-rga.json with your Confluence details');
            console.log('   2. Set required environment variables (especially API token)');
            console.log('   3. Run "npm run confluence:test" to verify connection');
            
        } else {
            console.error('❌ Configuration Initialization Failed:');
            console.error(`   ${result.message}`);
        }
        
    } catch (error: any) {
        console.error('❌ Unexpected Error:', error.message);
    }
}

/**
 * Publish generated documents to Confluence
 */
export async function publishToConfluence(
    documentsPath?: string,
    options: {
        parentPageTitle?: string;
        labelPrefix?: string;
        dryRun?: boolean;
        force?: boolean;
    } = {}
): Promise<void> {
    console.log('📤 Publishing Documents to Confluence...\n');
    
    try {
        const configManager = createConfluenceConfigManager();
        const config = configManager.getConfluenceConfig();
        
        // Validate configuration
        const validation = configManager.validateConfiguration();
        if (!validation.valid) {
            console.error('❌ Configuration Error - cannot publish');
            validation.errors.forEach(error => console.error(`   • ${error}`));
            return;
        }
        
        // Determine documents path
        const docsPath = documentsPath || join(process.cwd(), 'generated-documents');
        
        if (!existsSync(docsPath)) {
            console.error(`❌ Documents path does not exist: ${docsPath}`);
            return;
        }
        
        console.log(`📁 Publishing from: ${docsPath}`);
        
        // Show configuration
        console.log(`🎯 Target Space: ${config.spaceKey}`);
        console.log(`🌐 Confluence URL: ${config.baseUrl}`);
        
        if (options.parentPageTitle) {
            console.log(`📄 Parent Page: ${options.parentPageTitle}`);
        }
        
        if (options.dryRun) {
            console.log('🔍 DRY RUN MODE - No changes will be made\n');
        }
        
        // Create publisher
        const publisher = createConfluencePublisher(config);
        
        // Test connection first
        const connectionTest = await publisher.testConnection();
        if (!connectionTest.success) {
            console.error('❌ Connection test failed - cannot publish');
            console.error(`   ${connectionTest.error}`);
            return;
        }
        
        console.log('✅ Connection verified, starting publication...\n');
        
        if (options.dryRun) {
            console.log('📄 Documents that would be published:');
            const fs = require('fs');
            const files = fs.readdirSync(docsPath).filter((file: string) => file.endsWith('.md'));
            files.forEach((file: string) => {
                const title = file.replace('.md', '').replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
                console.log(`   • ${title} (${file})`);
            });
            return;
        }
        
        // Publish documents
        const publishingOptions = {
            parentPageTitle: options.parentPageTitle,
            labelPrefix: options.labelPrefix || 'adpa',
            includeMetadata: true
        };
        
        const results = await publisher.publishDocuments(docsPath, publishingOptions);
        
        // Show results
        console.log('\n📊 Publication Results:');
        console.log(`   Total Documents: ${results.length}`);
        
        const successful = results.filter(r => r.success);
        const failed = results.filter(r => !r.success);
        
        console.log(`   Successful: ${successful.length} ✅`);
        console.log(`   Failed: ${failed.length} ❌`);
        
        if (successful.length > 0) {
            console.log('\n✅ Successfully Published:');
            successful.forEach(result => {
                console.log(`   • ${result.title}`);
                if (result.pageUrl) {
                    console.log(`     URL: ${result.pageUrl}`);
                }
            });
        }
        
        if (failed.length > 0) {
            console.log('\n❌ Publication Failures:');
            failed.forEach(result => {
                console.log(`   • ${result.title}: ${result.error}`);
            });
        }
        
        console.log('\n🎉 Publication complete!');
        
    } catch (error: any) {
        console.error('❌ Publication Error:', error.message);
    }
}

/**
 * Show Confluence configuration status
 */
export async function showConfluenceStatus(): Promise<void> {
    console.log('📋 Confluence Integration Status\n');
    
    try {
        const configManager = createConfluenceConfigManager();
        const status = configManager.getConfigurationStatus();
        
        console.log('⚙️ Configuration:');
        console.log(`   File Exists: ${status.configured ? '✅' : '❌'}`);
        console.log(`   Valid Config: ${status.valid ? '✅' : '❌'}`);
        
        if (status.errors.length > 0) {
            console.log('\n❌ Configuration Errors:');
            status.errors.forEach(error => console.log(`   • ${error}`));
        }
        
        if (status.warnings.length > 0) {
            console.log('\n⚠️ Configuration Warnings:');
            status.warnings.forEach(warning => console.log(`   • ${warning}`));
        }
        
        console.log('\n🔐 Environment Variables:');
        if (status.envVarsSet.length > 0) {
            console.log('   Set:');
            status.envVarsSet.forEach(envVar => console.log(`     ✅ ${envVar}`));
        }
        
        if (status.envVarsMissing.length > 0) {
            console.log('   Missing:');
            status.envVarsMissing.forEach(envVar => console.log(`     ❌ ${envVar}`));
        }
        
        // Test connection if configuration is valid
        if (status.valid) {
            console.log('\n🔗 Connection Test:');
            const config = configManager.getConfluenceConfig();
            const publisher = createConfluencePublisher(config);
            
            try {
                const connectionResult = await publisher.testConnection();
                if (connectionResult.success) {
                    console.log('   Status: ✅ Connected');
                    console.log(`   User: ${connectionResult.userInfo.displayName}`);
                } else {
                    console.log('   Status: ❌ Connection Failed');
                    console.log(`   Error: ${connectionResult.error}`);
                }
            } catch (error: any) {
                console.log('   Status: ❌ Connection Error');
                console.log(`   Error: ${error.message}`);
            }
        }
        
        console.log('\n📋 Available Commands:');
        console.log('   npm run confluence:init     - Initialize configuration');
        console.log('   npm run confluence:test     - Test connection');
        console.log('   npm run confluence:publish  - Publish documents');
        console.log('   npm run confluence:status   - Show this status');
        
    } catch (error: any) {
        console.error('❌ Status Error:', error.message);
    }
}
