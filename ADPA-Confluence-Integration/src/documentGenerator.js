/**
 * Simplified Git to Confluence Publisher
 * Handles publishing Git repository content to Confluence
 */

import Resolver from '@forge/resolver';
import api, { route } from '@forge/api';
import { GitRepositoryManager } from './gitIntegration.js';

const resolver = new Resolver();

// Initialize Git repository manager
const gitManager = new GitRepositoryManager();

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
        const page = await createOrUpdateConfluencePage(
            'ADPA - README',
            readmeContent,
            context.spaceKey || 'ADPA',
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
        const parentPage = await createOrUpdateConfluencePage(
            'ADPA - Documentation',
            '# ADPA Documentation\n\nThis page contains documentation imported from the Git repository.',
            context.spaceKey || 'ADPA',
            null
        );
        
        // Publish each documentation file
        for (const docFile of docFiles) {
            try {
                const page = await createOrUpdateConfluencePage(
                    `ADPA - ${docFile.title}`,
                    docFile.content,
                    context.spaceKey || 'ADPA',
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

/**
 * Create or update a Confluence page
 */
async function createOrUpdateConfluencePage(title, content, spaceKey, parentId = null) {
    try {
        // Convert markdown content to Confluence storage format
        const storageContent = convertMarkdownToStorage(content);
        
        // Check if page already exists
        const searchResponse = await api.asApp().requestConfluence(
            route`/wiki/rest/api/content?spaceKey=${spaceKey}&title=${encodeURIComponent(title)}`
        );
        
        if (!searchResponse.ok) {
            throw new Error(`Failed to search for existing page: ${searchResponse.status}`);
        }
        
        const searchResult = await searchResponse.json();
        
        if (searchResult.results && searchResult.results.length > 0) {
            // Update existing page
            const existingPage = searchResult.results[0];
            const updateData = {
                version: {
                    number: existingPage.version.number + 1
                },
                title: title,
                type: 'page',
                body: {
                    storage: {
                        value: storageContent,
                        representation: 'storage'
                    }
                }
            };
            
            const updateResponse = await api.asApp().requestConfluence(
                route`/wiki/rest/api/content/${existingPage.id}`,
                {
                    method: 'PUT',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updateData)
                }
            );
            
            if (!updateResponse.ok) {
                throw new Error(`Failed to update page: ${updateResponse.status}`);
            }
            
            return await updateResponse.json();
        } else {
            // Create new page
            const createData = {
                type: 'page',
                title: title,
                space: {
                    key: spaceKey
                },
                body: {
                    storage: {
                        value: storageContent,
                        representation: 'storage'
                    }
                }
            };
            
            if (parentId) {
                createData.ancestors = [{ id: parentId }];
            }
            
            const createResponse = await api.asApp().requestConfluence(
                route`/wiki/rest/api/content`,
                {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(createData)
                }
            );
            
            if (!createResponse.ok) {
                throw new Error(`Failed to create page: ${createResponse.status}`);
            }
            
            return await createResponse.json();
        }
    } catch (error) {
        console.error('Error creating/updating Confluence page:', error);
        throw error;
    }
}

/**
 * Convert markdown content to Confluence storage format
 */
function convertMarkdownToStorage(markdown) {
    // Basic markdown to Confluence conversion
    // For a full implementation, you'd use a proper markdown-to-confluence library
    let html = markdown
        .replace(/^# (.*$)/gm, '<h1>$1</h1>')
        .replace(/^## (.*$)/gm, '<h2>$1</h2>')
        .replace(/^### (.*$)/gm, '<h3>$1</h3>')
        .replace(/^\*\*(.*)\*\*/gm, '<strong>$1</strong>')
        .replace(/^\*(.*)\*/gm, '<em>$1</em>')
        .replace(/^\* (.*$)/gm, '<li>$1</li>')
        .replace(/^- (.*$)/gm, '<li>$1</li>')
        .replace(/```([^`]+)```/g, '<ac:structured-macro ac:name="code"><ac:plain-text-body><![CDATA[$1]]></ac:plain-text-body></ac:structured-macro>')
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/\n/g, '<br/>');
    
    // Wrap consecutive list items in ul tags
    html = html.replace(/(<li>.*<\/li>)/g, '<ul>$1</ul>');
    
    return html;
}

export const handler = resolver.getDefinitions();
