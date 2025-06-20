/**
 * ADPA Confluence Publisher Function
 * Handles publishing operations and Confluence API interactions
 */

import Resolver from '@forge/resolver';
import api, { route } from '@forge/api';

const resolver = new Resolver();

/**
 * Get current user information
 */
resolver.define('getCurrentUser', async (req) => {
    try {
        const response = await api.asApp().requestConfluence(route`/wiki/rest/api/user/current`);
        
        if (!response.ok) {
            throw new Error(`Failed to get current user: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Get current user error:', error);
        throw error;
    }
});

/**
 * Get space information
 */
resolver.define('getSpace', async (req) => {
    try {
        const { spaceKey = 'ADPA' } = req.payload;
        
        const response = await api.asApp().requestConfluence(route`/wiki/rest/api/space/${spaceKey}`);
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error(`Space '${spaceKey}' not found`);
            }
            throw new Error(`Failed to get space: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Get space error:', error);
        throw error;
    }
});

/**
 * List accessible spaces
 */
resolver.define('getAccessibleSpaces', async (req) => {
    try {
        const response = await api.asApp().requestConfluence(route`/wiki/rest/api/space`, {
            params: {
                limit: 50,
                expand: 'description.plain,homepage'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Failed to get spaces: ${response.status}`);
        }
        
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error('Get accessible spaces error:', error);
        throw error;
    }
});

/**
 * Test Confluence connection
 */
resolver.define('testConnection', async (req) => {
    try {
        // Test basic connectivity
        const userResponse = await api.asApp().requestConfluence(route`/wiki/rest/api/user/current`);
        
        if (!userResponse.ok) {
            throw new Error(`Connection test failed: ${userResponse.status}`);
        }
        
        const user = await userResponse.json();
        
        // Test space access
        const { spaceKey = 'ADPA' } = req.payload;
        let spaceInfo = null;
        
        try {
            const spaceResponse = await api.asApp().requestConfluence(route`/wiki/rest/api/space/${spaceKey}`);
            if (spaceResponse.ok) {
                spaceInfo = await spaceResponse.json();
            }
        } catch (spaceError) {
            console.warn('Space access test failed:', spaceError);
        }
        
        return {
            success: true,
            user: {
                displayName: user.displayName,
                email: user.email,
                accountId: user.accountId
            },
            space: spaceInfo ? {
                name: spaceInfo.name,
                key: spaceInfo.key,
                description: spaceInfo.description?.plain?.value
            } : null,
            timestamp: new Date().toISOString()
        };
        
    } catch (error) {
        console.error('Connection test error:', error);
        return {
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        };
    }
});

/**
 * Create or update a Confluence page
 */
resolver.define('createOrUpdatePage', async (req) => {
    try {
        const { 
            title, 
            content, 
            spaceKey = 'ADPA', 
            parentPageId,
            update = false,
            pageId
        } = req.payload;
        
        if (!title || !content) {
            throw new Error('Title and content are required');
        }
        
        const pageData = {
            type: 'page',
            title: title,
            space: {
                key: spaceKey
            },
            body: {
                storage: {
                    value: content,
                    representation: 'storage'
                }
            }
        };
        
        if (parentPageId) {
            pageData.ancestors = [{ id: parentPageId }];
        }
        
        let response;
        
        if (update && pageId) {
            // Update existing page
            const existingPageResponse = await api.asApp().requestConfluence(route`/wiki/rest/api/content/${pageId}`);
            const existingPage = await existingPageResponse.json();
            
            pageData.version = {
                number: existingPage.version.number + 1
            };
            
            response = await api.asApp().requestConfluence(route`/wiki/rest/api/content/${pageId}`, {
                method: 'PUT',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(pageData)
            });
        } else {
            // Create new page
            response = await api.asApp().requestConfluence(route`/wiki/rest/api/content`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(pageData)
            });
        }
        
        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Failed to ${update ? 'update' : 'create'} page: ${response.status} ${error}`);
        }
        
        const page = await response.json();
        
        return {
            success: true,
            page: {
                id: page.id,
                title: page.title,
                url: page._links?.webui,
                version: page.version?.number
            }
        };
        
    } catch (error) {
        console.error('Create/update page error:', error);
        return {
            success: false,
            error: error.message
        };
    }
});

/**
 * Get pages in a space
 */
resolver.define('getSpacePages', async (req) => {
    try {
        const { spaceKey = 'ADPA', limit = 25 } = req.payload;
        
        const response = await api.asApp().requestConfluence(route`/wiki/rest/api/content`, {
            params: {
                spaceKey: spaceKey,
                type: 'page',
                limit: limit,
                expand: 'version,space,ancestors'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Failed to get pages: ${response.status}`);
        }
        
        const data = await response.json();
        
        return {
            success: true,
            pages: data.results.map(page => ({
                id: page.id,
                title: page.title,
                url: page._links?.webui,
                version: page.version?.number,
                created: page.version?.when,
                createdBy: page.version?.by?.displayName
            })),
            total: data.size
        };
        
    } catch (error) {
        console.error('Get space pages error:', error);
        return {
            success: false,
            error: error.message
        };
    }
});

export const handler = resolver.getDefinitions();
