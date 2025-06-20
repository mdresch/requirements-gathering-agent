/**
 * Simplified Git to Confluence Publisher
 * Handles publishing Git repository content to Confluence
 */

import Resolver from '@forge/resolver';
import api, { route } from '@forge/api';
import { GitRepositoryManager } from './gitIntegration.js';
import { ConfluencePublisher } from './confluencePublisher.js';

const resolver = new Resolver();

// Initialize Git repository manager and Confluence publisher
const gitManager = new GitRepositoryManager();
const confluencePublisher = new ConfluencePublisher();

/**
 * Handle web trigger requests for Git publishing
 */
resolver.define('handleGitPublishing', async (req) => {
    console.log('Git publishing request:', req);
    
    try {
        const { action } = req.payload || {};
        
        switch (action) {
            case 'publish_readme':
                return await publishReadmeToConfluence(req.context);
                
            case 'publish_docs':
                return await publishDocsToConfluence(req.context);
                
            case 'check_status':
                return await checkRepositoryStatus();
                
            default:
                throw new Error(`Unknown action: ${action}`);
        }
        
    } catch (error) {
        console.error('Git publishing error:', error);
        return {
            success: false,
            error: error.message,
            message: 'Git publishing operation failed'
        };
    }
});

/**
 * Publish README from Git repository to Confluence
 */
async function publishReadmeToConfluence(context) {
    try {
        console.log('Publishing README to Confluence...');
        
        // Get README content from Git
        const readmeContent = await gitManager.getReadmeContent();
        
        // Publish to Confluence
        const page = await confluencePublisher.createOrUpdatePage(
            'ADPA - README',
            readmeContent,
            context.spaceKey,
            null // No parent page
        );
        
        return {
            success: true,
            message: 'README published successfully',
            pageId: page.id,
            pageUrl: page._links?.webui || `${context.siteUrl}/pages/${page.id}`
        };
        
    } catch (error) {
        console.error('Error publishing README:', error);
        throw error;
    }
}

/**
 * Publish documentation files from Git repository to Confluence
 */
async function publishDocsToConfluence(context) {
    try {
        console.log('Publishing documentation to Confluence...');
        
        // Get documentation files from Git
        const docFiles = await gitManager.getDocumentationFiles();
        
        if (docFiles.length === 0) {
            return {
                success: true,
                message: 'No documentation files found in repository',
                publishedCount: 0
            };
        }
        
        const results = [];
        let successCount = 0;
        
        // Create parent page for documentation
        const parentPage = await confluencePublisher.createOrUpdatePage(
            'ADPA - Documentation',
            '# ADPA Documentation\n\nThis page contains documentation imported from the Git repository.',
            context.spaceKey,
            null
        );
        
        // Publish each documentation file
        for (const docFile of docFiles) {
            try {
                const page = await confluencePublisher.createOrUpdatePage(
                    `ADPA - ${docFile.title}`,
                    docFile.content,
                    context.spaceKey,
                    parentPage.id
                );
                
                results.push({
                    filename: docFile.filename,
                    title: docFile.title,
                    status: 'success',
                    pageId: page.id
                });
                
                successCount++;
                
            } catch (error) {
                console.error(`Error publishing ${docFile.filename}:`, error);
                results.push({
                    filename: docFile.filename,
                    title: docFile.title,
                    status: 'error',
                    error: error.message
                });
            }
        }
        
        return {
            success: true,
            message: `Published ${successCount} of ${docFiles.length} documentation files`,
            publishedCount: successCount,
            totalCount: docFiles.length,
            results
        };
        
    } catch (error) {
        console.error('Error publishing documentation:', error);
        throw error;
    }
}

/**
 * Check repository status and connection
 */
async function checkRepositoryStatus() {
    try {
        console.log('Checking repository status...');
        
        // Ensure repository is accessible
        await gitManager.ensureRepository();
        
        // Get basic repository information
        const readmeExists = await gitManager.getReadmeContent().then(() => true).catch(() => false);
        const docFiles = await gitManager.getDocumentationFiles();
        
        return {
            success: true,
            message: 'Repository is accessible and up to date',
            status: {
                connected: true,
                readmeExists,
                documentationFiles: docFiles.length,
                lastChecked: new Date().toISOString()
            }
        };
        
    } catch (error) {
        console.error('Error checking repository status:', error);
        return {
            success: false,
            message: 'Repository connection failed',
            status: {
                connected: false,
                error: error.message,
                lastChecked: new Date().toISOString()
            }
        };
    }
}

export const handler = resolver.getDefinitions();
