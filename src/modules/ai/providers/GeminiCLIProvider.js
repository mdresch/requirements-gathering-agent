#!/usr/bin/env node

/**
 * Gemini CLI Provider Integration for Requirements Gathering Agent
 * Adds support for Google's new Gemini CLI with 1M token context window
 */

import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';

export class GeminiCLIProvider {
    constructor(config = {}) {
        this.config = {
            model: 'gemini-2.5-pro',
            contextWindow: 1000000, // 1 million tokens
            searchEnabled: true,
            mcpEnabled: true,
            maxRequestsPerMinute: 60,
            maxRequestsPerDay: 1000,
            ...config
        };
        
        this.requestCount = {
            minute: 0,
            day: 0,
            lastMinute: Math.floor(Date.now() / 60000),
            lastDay: Math.floor(Date.now() / 86400000)
        };
    }

    /**
     * Check if Gemini CLI is installed and configured
     */
    async checkInstallation() {
        try {
            const result = await this.runCommand('gemini --version');
            return {
                installed: result.success,
                version: result.stdout.trim(),
                authenticated: await this.checkAuthentication()
            };
        } catch (error) {
            return {
                installed: false,
                error: error.message,
                authenticated: false
            };
        }
    }

    /**
     * Check if user is authenticated with Gemini CLI
     */
    async checkAuthentication() {
        try {
            const result = await this.runCommand('gemini auth status');
            return result.success && result.stdout.includes('authenticated');
        } catch (error) {
            return false;
        }
    }

    /**
     * Initialize Gemini CLI authentication
     */
    async authenticate() {
        try {
            console.log('🔐 Starting Gemini CLI authentication...');
            const result = await this.runCommand('gemini auth login', { interactive: true });
            return result.success;
        } catch (error) {
            console.error('❌ Authentication failed:', error.message);
            return false;
        }
    }

    /**
     * Check and enforce rate limits
     */
    checkRateLimit() {
        const now = Date.now();
        const currentMinute = Math.floor(now / 60000);
        const currentDay = Math.floor(now / 86400000);

        // Reset counters if minute/day has changed
        if (currentMinute > this.requestCount.lastMinute) {
            this.requestCount.minute = 0;
            this.requestCount.lastMinute = currentMinute;
        }
        
        if (currentDay > this.requestCount.lastDay) {
            this.requestCount.day = 0;
            this.requestCount.lastDay = currentDay;
        }

        // Check limits
        if (this.requestCount.minute >= this.config.maxRequestsPerMinute) {
            throw new Error(`Rate limit exceeded: ${this.config.maxRequestsPerMinute} requests per minute`);
        }
        
        if (this.requestCount.day >= this.config.maxRequestsPerDay) {
            throw new Error(`Rate limit exceeded: ${this.config.maxRequestsPerDay} requests per day`);
        }

        // Increment counters
        this.requestCount.minute++;
        this.requestCount.day++;
    }

    /**
     * Generate content using Gemini CLI with large context
     */
    async generateContent(prompt, options = {}) {
        this.checkRateLimit();

        const {
            includeContext = true,
            includeSearch = false,
            contextFiles = [],
            outputFormat = 'markdown',
            temperature = 0.7
        } = options;

        try {
            // Build command
            let command = `gemini generate`;
            
            // Add model specification
            command += ` --model ${this.config.model}`;
            
            // Add temperature
            command += ` --temperature ${temperature}`;
            
            // Add output format
            command += ` --format ${outputFormat}`;
            
            // Enable search if requested
            if (includeSearch && this.config.searchEnabled) {
                command += ` --search`;
            }
            
            // Include context files (leverage 1M token window)
            if (includeContext && contextFiles.length > 0) {
                const contextData = await this.loadContextFiles(contextFiles);
                const tempContextFile = await this.createTempFile(contextData);
                command += ` --context "${tempContextFile}"`;
            }
            
            // Add the prompt
            command += ` "${prompt}"`;
            
            console.log(`🧠 Generating content with Gemini CLI (${this.config.model})`);
            const result = await this.runCommand(command);
            
            if (result.success) {
                return {
                    success: true,
                    content: result.stdout,
                    usage: {
                        model: this.config.model,
                        tokensUsed: this.estimateTokens(prompt + (contextFiles.length > 0 ? ' + context' : '')),
                        requestsRemaining: {
                            minute: this.config.maxRequestsPerMinute - this.requestCount.minute,
                            day: this.config.maxRequestsPerDay - this.requestCount.day
                        }
                    }
                };
            } else {
                throw new Error(result.stderr || result.error || 'Generation failed');
            }
            
        } catch (error) {
            return {
                success: false,
                error: error.message,
                usage: {
                    requestsRemaining: {
                        minute: this.config.maxRequestsPerMinute - this.requestCount.minute,
                        day: this.config.maxRequestsPerDay - this.requestCount.day
                    }
                }
            };
        }
    }

    /**
     * Perform comprehensive analysis with full context
     */
    async analyzeWithFullContext(analysisType, projectPath, options = {}) {
        console.log(`🔍 Starting comprehensive ${analysisType} analysis...`);
        
        try {
            // Load all relevant project files (up to 1M tokens)
            const contextFiles = await this.gatherProjectContext(projectPath, analysisType);
            
            // Build analysis prompt based on type
            const prompt = this.buildAnalysisPrompt(analysisType, options);
            
            // Generate with full context
            return await this.generateContent(prompt, {
                includeContext: true,
                includeSearch: options.includeLatestStandards || false,
                contextFiles,
                outputFormat: 'json'
            });
            
        } catch (error) {
            console.error(`❌ Analysis failed:`, error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Research latest standards and best practices
     */
    async researchStandards(domain, standards = []) {
        const researchPrompt = `
Research the latest updates and requirements for ${domain} compliance standards.
Focus on: ${standards.join(', ')}

Please provide:
1. Recent changes or updates (2024-2025)
2. New requirements or recommendations  
3. Best practices for implementation
4. Common compliance gaps
5. Tools and methodologies

Use current web sources and provide citations.
        `.trim();

        return await this.generateContent(researchPrompt, {
            includeSearch: true,
            outputFormat: 'markdown'
        });
    }

    /**
     * Load and concatenate context files within token limit
     */
    async loadContextFiles(filePaths) {
        const maxTokens = this.config.contextWindow * 0.8; // Reserve 20% for prompt/response
        let totalContent = '';
        let tokenCount = 0;
        
        for (const filePath of filePaths) {
            try {
                const content = await fs.readFile(filePath, 'utf8');
                const fileTokens = this.estimateTokens(content);
                
                if (tokenCount + fileTokens <= maxTokens) {
                    totalContent += `\n\n--- FILE: ${filePath} ---\n${content}`;
                    tokenCount += fileTokens;
                } else {
                    console.warn(`⚠️  Skipping ${filePath} - would exceed context window`);
                    break;
                }
            } catch (error) {
                console.warn(`⚠️  Could not read ${filePath}:`, error.message);
            }
        }
        
        console.log(`📄 Loaded ${filePaths.length} files (${tokenCount.toLocaleString()} tokens)`);
        return totalContent;
    }

    /**
     * Gather relevant project context files
     */
    async gatherProjectContext(projectPath, analysisType) {
        const contextFiles = [];
        
        try {
            // Common files for all analysis types
            const commonPatterns = [
                'README.md',
                'package.json',
                'tsconfig.json',
                '.env',
                'docs/**/*.md'
            ];
            
            // Analysis-specific patterns
            const typePatterns = {
                'iso15408': [
                    'src/**/*.ts',
                    'src/**/*.js', 
                    'security/**/*',
                    'docs/security/**/*',
                    'docs/compliance/**/*'
                ],
                'pmbok': [
                    'docs/project/**/*',
                    'docs/planning/**/*',
                    'docs/management/**/*'
                ],
                'babok': [
                    'docs/requirements/**/*',
                    'docs/business-analysis/**/*',
                    'docs/stakeholder/**/*'
                ]
            };
            
            const patterns = [...commonPatterns, ...(typePatterns[analysisType] || [])];
            
            // Find matching files
            for (const pattern of patterns) {
                const files = await this.findFiles(projectPath, pattern);
                contextFiles.push(...files);
            }
            
            // Remove duplicates and limit to manageable number
            const uniqueFiles = [...new Set(contextFiles)];
            return uniqueFiles.slice(0, 100); // Reasonable limit
            
        } catch (error) {
            console.warn(`⚠️  Error gathering context:`, error.message);
            return [];
        }
    }

    /**
     * Build analysis prompt based on type
     */
    buildAnalysisPrompt(analysisType, options = {}) {
        const prompts = {
            'iso15408': `
Perform a comprehensive ISO 15408 (Common Criteria) security compliance analysis.

Analyze the provided codebase and documentation for:
1. Security Functional Requirements (SFRs)
2. Security Assurance Requirements (SARs) 
3. Protection Profile conformance
4. Threat modeling completeness
5. Vulnerability assessment
6. Risk management practices

Provide detailed findings with:
- Compliance gaps and recommendations
- Security control effectiveness
- Risk levels and mitigation strategies
- Evaluation Assurance Level (EAL) assessment

Output as structured JSON with compliance scoring.
            `,
            'security-audit': `
Conduct a comprehensive security audit of the provided codebase.

Focus on:
1. Authentication and authorization
2. Input validation and sanitization
3. Cryptographic implementations
4. Session management
5. Error handling and logging
6. Configuration security
7. Dependency security

Provide actionable recommendations with priority levels.
            `,
            'standards-compliance': `
Analyze compliance with multiple standards: ${options.standards?.join(', ') || 'PMBOK, BABOK, DMBOK'}

Evaluate:
1. Documentation completeness
2. Process adherence  
3. Quality metrics
4. Best practice implementation
5. Gaps and deviations

Provide compliance scores and improvement recommendations.
            `
        };
        
        return prompts[analysisType] || `Analyze the provided content for: ${analysisType}`;
    }

    /**
     * Estimate token count (rough approximation)
     */
    estimateTokens(text) {
        // Rough estimation: ~4 characters per token for English text
        return Math.ceil(text.length / 4);
    }

    /**
     * Find files matching pattern in directory
     */
    async findFiles(basePath, pattern) {
        // Simple glob-like pattern matching
        // In production, use a proper glob library
        try {
            const { globby } = await import('globby');
            return await globby(pattern, { cwd: basePath, absolute: true });
        } catch (error) {
            // Fallback to basic file discovery
            return [];
        }
    }

    /**
     * Create temporary file for context data
     */
    async createTempFile(content) {
        const tempPath = path.join(process.cwd(), 'temp', `context-${Date.now()}.txt`);
        await fs.mkdir(path.dirname(tempPath), { recursive: true });
        await fs.writeFile(tempPath, content);
        return tempPath;
    }

    /**
     * Run command with proper error handling
     */
    runCommand(command, options = {}) {
        return new Promise((resolve) => {
            const [cmd, ...args] = command.split(' ');
            const child = spawn(cmd, args, {
                cwd: process.cwd(),
                shell: true,
                stdio: options.interactive ? 'inherit' : ['pipe', 'pipe', 'pipe']
            });

            if (options.interactive) {
                child.on('close', (code) => {
                    resolve({
                        success: code === 0,
                        stdout: '',
                        stderr: code !== 0 ? `Exit code: ${code}` : ''
                    });
                });
                return;
            }

            let stdout = '';
            let stderr = '';

            child.stdout.on('data', (data) => {
                stdout += data.toString();
            });

            child.stderr.on('data', (data) => {
                stderr += data.toString();
            });

            const timeout = setTimeout(() => {
                child.kill();
                resolve({
                    success: false,
                    error: 'Command timed out',
                    stdout,
                    stderr
                });
            }, 30000); // 30 second timeout

            child.on('close', (code) => {
                clearTimeout(timeout);
                resolve({
                    success: code === 0,
                    stdout,
                    stderr: code !== 0 ? stderr || `Exit code: ${code}` : ''
                });
            });
        });
    }

    /**
     * Get provider status and capabilities
     */
    async getStatus() {
        const installation = await this.checkInstallation();
        
        return {
            provider: 'gemini-cli',
            available: installation.installed && installation.authenticated,
            model: this.config.model,
            contextWindow: this.config.contextWindow,
            features: {
                largeContext: true,
                search: this.config.searchEnabled,
                mcp: this.config.mcpEnabled,
                freeUsage: true
            },
            limits: {
                requestsPerMinute: this.config.maxRequestsPerMinute,
                requestsPerDay: this.config.maxRequestsPerDay,
                remaining: {
                    minute: this.config.maxRequestsPerMinute - this.requestCount.minute,
                    day: this.config.maxRequestsPerDay - this.requestCount.day
                }
            },
            installation
        };
    }
}

export default GeminiCLIProvider;
