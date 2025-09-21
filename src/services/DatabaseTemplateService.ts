import { dbConnection } from '../config/database.js';
import { logger } from '../utils/logger.js';

/**
 * Database Template Service
 * 
 * This service provides access to templates stored in the MongoDB database,
 * allowing document processors to use dynamic templates instead of hardcoded ones.
 */
export class DatabaseTemplateService {
  private static instance: DatabaseTemplateService;
  private templatesCache: Map<string, any> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  public static getInstance(): DatabaseTemplateService {
    if (!DatabaseTemplateService.instance) {
      DatabaseTemplateService.instance = new DatabaseTemplateService();
    }
    return DatabaseTemplateService.instance;
  }

  /**
   * Get a template by its ID or name from the database
   * @param templateIdentifier - Template ID or name
   * @param useCache - Whether to use cached version (default: true)
   * @returns Template data or null if not found
   */
  public async getTemplate(templateIdentifier: string, useCache: boolean = true): Promise<any | null> {
    try {
      // Check cache first
      if (useCache && this.isCached(templateIdentifier)) {
        logger.debug(`📋 Using cached template: ${templateIdentifier}`);
        return this.templatesCache.get(templateIdentifier);
      }

      // Fetch from database
      const template = await this.fetchTemplateFromDatabase(templateIdentifier);
      
      if (template) {
        // Cache the result
        this.templatesCache.set(templateIdentifier, template);
        this.cacheExpiry.set(templateIdentifier, Date.now() + this.CACHE_DURATION);
        logger.info(`✅ Template loaded from database: ${templateIdentifier}`);
      } else {
        logger.warn(`⚠️ Template not found in database: ${templateIdentifier}`);
      }

      return template;
    } catch (error) {
      logger.error(`❌ Error fetching template ${templateIdentifier}:`, error);
      return null;
    }
  }

  /**
   * Get all templates from the database
   * @returns Array of all templates
   */
  public async getAllTemplates(): Promise<any[]> {
    try {
      logger.info('📋 Fetching all templates from database...');
      const collection = await this.getTemplatesCollection();
      const templates = await collection.find({}).toArray();
      
      logger.info(`✅ Retrieved ${templates.length} templates from database`);
      return templates;
    } catch (error) {
      logger.error('❌ Database error fetching all templates:', error);
      return [];
    }
  }

  /**
   * Get multiple templates by their identifiers
   * @param templateIdentifiers - Array of template IDs or names
   * @returns Map of template identifier to template data
   */
  public async getTemplates(templateIdentifiers: string[]): Promise<Map<string, any>> {
    const results = new Map<string, any>();
    
    // Fetch all templates in parallel
    const promises = templateIdentifiers.map(async (identifier) => {
      const template = await this.getTemplate(identifier);
      if (template) {
        results.set(identifier, template);
      }
    });

    await Promise.all(promises);
    return results;
  }

  /**
   * Search for templates by category or name pattern
   * @param searchCriteria - Search criteria object
   * @returns Array of matching templates
   */
  public async searchTemplates(searchCriteria: {
    category?: string;
    namePattern?: string;
    isActive?: boolean;
    limit?: number;
  }): Promise<any[]> {
    try {
      const collection = await this.getTemplatesCollection();
      
      const query: any = {};
      
      if (searchCriteria.category) {
        query.category = searchCriteria.category;
      }
      
      if (searchCriteria.namePattern) {
        query.name = { $regex: searchCriteria.namePattern, $options: 'i' };
      }
      
      if (searchCriteria.isActive !== undefined) {
        query.is_active = searchCriteria.isActive;
      }

      const cursor = collection.find(query);
      
      if (searchCriteria.limit) {
        cursor.limit(searchCriteria.limit);
      }

      const templates = await cursor.toArray();
      logger.info(`🔍 Found ${templates.length} templates matching criteria`);
      
      return templates;
    } catch (error) {
      logger.error('❌ Error searching templates:', error);
      return [];
    }
  }

  /**
   * Clear the template cache
   * @param templateIdentifier - Specific template to clear, or all if not provided
   */
  public clearCache(templateIdentifier?: string): void {
    if (templateIdentifier) {
      this.templatesCache.delete(templateIdentifier);
      this.cacheExpiry.delete(templateIdentifier);
      logger.debug(`🗑️ Cleared cache for template: ${templateIdentifier}`);
    } else {
      this.templatesCache.clear();
      this.cacheExpiry.clear();
      logger.debug('🗑️ Cleared all template cache');
    }
  }

  /**
   * Check if a template is cached and still valid
   */
  private isCached(templateIdentifier: string): boolean {
    if (!this.templatesCache.has(templateIdentifier)) {
      return false;
    }

    const expiry = this.cacheExpiry.get(templateIdentifier);
    if (!expiry || Date.now() > expiry) {
      this.templatesCache.delete(templateIdentifier);
      this.cacheExpiry.delete(templateIdentifier);
      return false;
    }

    return true;
  }

  /**
   * Fetch template from MongoDB database
   */
  private async fetchTemplateFromDatabase(templateIdentifier: string): Promise<any | null> {
    try {
      const collection = await this.getTemplatesCollection();
      
      // Try to find by ID first, then by name
      let template = await collection.findOne({ 
        $or: [
          { id: templateIdentifier },
          { name: { $regex: `^${templateIdentifier}$`, $options: 'i' } }
        ]
      });

      if (!template) {
        // Try partial name match for business case variations
        template = await collection.findOne({
          name: { $regex: templateIdentifier, $options: 'i' }
        });
      }

      return template;
    } catch (error) {
      logger.error('❌ Database error fetching template:', error);
      return null;
    }
  }

  /**
   * Get the templates collection from MongoDB
   */
  private async getTemplatesCollection() {
    if (!dbConnection.isConnectionActive()) {
      await dbConnection.connect();
    }
    
    // Get the mongoose connection and use it to access the database
    const mongoose = await import('mongoose');
    
    // Wait for connection to be ready
    if (mongoose.connection.readyState !== 1) {
      await new Promise((resolve, reject) => {
        mongoose.connection.once('connected', resolve);
        mongoose.connection.once('error', reject);
        setTimeout(() => reject(new Error('Connection timeout')), 5000);
      });
    }
    
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection is not available');
    }
    return db.collection('templates');
  }

  /**
   * Get template content for document generation
   * This method extracts the relevant content for AI generation
   */
  public async getTemplateContent(templateIdentifier: string): Promise<{
    aiInstructions: string;
    promptTemplate: string;
    metadata: any;
    templateData: any;
  } | null> {
    const template = await this.getTemplate(templateIdentifier);
    
    if (!template) {
      return null;
    }

    return {
      aiInstructions: template.ai_instructions || '',
      promptTemplate: template.prompt_template || '',
      metadata: template.metadata || {},
      templateData: {
        name: template.name,
        description: template.description,
        category: template.category,
        tags: template.metadata?.tags || [],
        variables: template.metadata?.variables || [],
        layout: template.metadata?.layout || {}
      }
    };
  }

  /**
   * Check if a template exists in the database
   */
  public async templateExists(templateIdentifier: string): Promise<boolean> {
    const template = await this.getTemplate(templateIdentifier);
    return template !== null;
  }
}

export default DatabaseTemplateService;
