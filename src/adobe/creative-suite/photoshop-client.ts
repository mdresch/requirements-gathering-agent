/**
 * Adobe Photoshop API Client
 * 
 * Provides integration with Adobe Photoshop APIs for automated
 * image enhancement, batch processing, and visual optimization.
 */

import { CreativeSuiteAuthenticator } from './authenticator.js';
import { creativeSuiteConfig } from './config.js';

export interface ImageProcessingRequest {
    inputPath: string;
    operations: ImageOperation[];
    outputOptions: ImageOutputOptions;
    metadata?: ImageMetadata;
}

export interface ImageOperation {
    type: 'resize' | 'crop' | 'enhance' | 'filter' | 'branding' | 'composite' | 'text-overlay';
    parameters: any;
    order: number;
}

export interface ImageOutputOptions {
    format: 'png' | 'jpg' | 'pdf' | 'psd' | 'tiff';
    quality: number; // 1-100
    dpi: number;
    colorSpace: 'RGB' | 'CMYK' | 'Grayscale';
    compression?: 'none' | 'lzw' | 'zip' | 'jpeg';
}

export interface ImageMetadata {
    title?: string;
    description?: string;
    author?: string;
    copyright?: string;
    keywords?: string[];
    createdDate?: Date;
}

export interface ResizeOperation {
    width?: number;
    height?: number;
    maintainAspectRatio: boolean;
    resizeMethod: 'bicubic' | 'bilinear' | 'preserve-details';
}

export interface CropOperation {
    x: number;
    y: number;
    width: number;
    height: number;
    units: 'pixels' | 'percent';
}

export interface EnhanceOperation {
    autoLevels: boolean;
    autoColor: boolean;
    autoContrast: boolean;
    sharpen: boolean;
    noiseReduction: boolean;
    brightness?: number; // -100 to 100
    contrast?: number; // -100 to 100
}

export interface BrandingOperation {
    logoPath?: string;
    logoPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
    logoOpacity: number; // 0-100
    watermark?: {
        text: string;
        font: string;
        size: number;
        color: string;
        opacity: number;
        position: string;
    };
    border?: {
        width: number;
        color: string;
        style: 'solid' | 'dashed' | 'dotted';
    };
}

export interface TextOverlayOperation {
    text: string;
    font: string;
    size: number;
    color: string;
    position: {
        x: number;
        y: number;
        alignment: 'left' | 'center' | 'right';
    };
    background?: {
        color: string;
        opacity: number;
        padding: number;
    };
}

export interface CompositeOperation {
    layers: CompositeLayer[];
    blendMode: 'normal' | 'multiply' | 'screen' | 'overlay' | 'soft-light';
    backgroundPath?: string;
}

export interface CompositeLayer {
    imagePath: string;
    position: { x: number; y: number };
    opacity: number;
    blendMode: string;
    transform?: {
        scaleX: number;
        scaleY: number;
        rotation: number;
    };
}

export interface PhotoshopAsset {
    id: string;
    inputPath: string;
    outputPath: string;
    format: string;
    dimensions: {
        width: number;
        height: number;
        dpi: number;
    };
    fileSize: number;
    operations: string[];
    metadata: {
        createdAt: Date;
        processingTime: number;
        operationsCount: number;
        qualityScore: number;
    };
    previewUrl?: string;
}

export interface BatchProcessingOptions {
    concurrency: number;
    skipExisting: boolean;
    onProgress?: (processed: number, total: number) => void;
    onError?: (error: Error, file: string) => void;
}

export class PhotoshopAPIClient {
    private authenticator: CreativeSuiteAuthenticator;
    private apiEndpoint: string;
    private accessToken: string | null = null;

    constructor() {
        this.authenticator = new CreativeSuiteAuthenticator();
        this.apiEndpoint = creativeSuiteConfig.getConfig().apis.photoshop.endpoint;
    }

    /**
     * Initialize the client and authenticate with Adobe Photoshop API
     */
    async initialize(): Promise<void> {
        const authResult = await this.authenticator.authenticate();
        this.accessToken = authResult.accessToken;
    }

    /**
     * Process a single image with specified operations
     */
    async processImage(request: ImageProcessingRequest): Promise<PhotoshopAsset> {
        await this.ensureAuthenticated();

        const startTime = Date.now();

        try {
            // Phase 2 Implementation: Call actual Adobe Photoshop API
            const asset = await this.executeImageProcessing(request);

            return {
                id: `photoshop-${Date.now()}`,
                inputPath: request.inputPath,
                outputPath: asset.outputPath,
                format: request.outputOptions.format,
                dimensions: asset.dimensions,
                fileSize: asset.fileSize,
                operations: request.operations.map(op => op.type),
                metadata: {
                    createdAt: new Date(),
                    processingTime: Date.now() - startTime,
                    operationsCount: request.operations.length,
                    qualityScore: this.calculateQualityScore(request.operations, request.outputOptions)
                }
            };

        } catch (error) {
            console.error('Image processing failed:', error);
            throw new Error(`Failed to process image: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Batch process multiple images with the same operations
     */
    async batchProcessImages(
        requests: ImageProcessingRequest[],
        options: BatchProcessingOptions = { concurrency: 3, skipExisting: false }
    ): Promise<PhotoshopAsset[]> {
        const assets: PhotoshopAsset[] = [];
        let processed = 0;

        // Process in batches based on concurrency
        for (let i = 0; i < requests.length; i += options.concurrency) {
            const batch = requests.slice(i, i + options.concurrency);
            const batchPromises = batch.map(async (request) => {
                try {
                    const asset = await this.processImage(request);
                    processed++;
                    options.onProgress?.(processed, requests.length);
                    return asset;
                } catch (error) {
                    options.onError?.(error as Error, request.inputPath);
                    throw error;
                }
            });

            const batchResults = await Promise.allSettled(batchPromises);
            
            for (const result of batchResults) {
                if (result.status === 'fulfilled') {
                    assets.push(result.value);
                }
            }
        }

        return assets;
    }

    /**
     * Enhance screenshots and document images for professional presentation
     */
    async enhanceDocumentImages(
        imagePaths: string[],
        enhancementLevel: 'minimal' | 'standard' | 'maximum' = 'standard'
    ): Promise<PhotoshopAsset[]> {
        const operations = this.getDocumentEnhancementOperations(enhancementLevel);
        
        const requests: ImageProcessingRequest[] = imagePaths.map(imagePath => ({
            inputPath: imagePath,
            operations,
            outputOptions: {
                format: 'png',
                quality: 95,
                dpi: 300,
                colorSpace: 'RGB'
            },
            metadata: {
                title: `Enhanced Document Image`,
                description: `Professionally enhanced for document inclusion`,
                author: 'Adobe Creative Suite API',
                createdDate: new Date()
            }
        }));

        return this.batchProcessImages(requests);
    }

    /**
     * Apply consistent branding to multiple images
     */
    async applyBrandingToImages(
        imagePaths: string[],
        branding: BrandingOperation
    ): Promise<PhotoshopAsset[]> {
        const requests: ImageProcessingRequest[] = imagePaths.map(imagePath => ({
            inputPath: imagePath,
            operations: [
                {
                    type: 'branding',
                    parameters: branding,
                    order: 1
                }
            ],
            outputOptions: {
                format: 'png',
                quality: 95,
                dpi: 300,
                colorSpace: 'RGB'
            }
        }));

        return this.batchProcessImages(requests);
    }

    /**
     * Create composite images for document headers, covers, etc.
     */
    async createComposite(
        backgroundPath: string,
        layers: CompositeLayer[],
        outputOptions: ImageOutputOptions
    ): Promise<PhotoshopAsset> {
        const composite: CompositeOperation = {
            layers,
            blendMode: 'normal',
            backgroundPath
        };

        const request: ImageProcessingRequest = {
            inputPath: backgroundPath,
            operations: [
                {
                    type: 'composite',
                    parameters: composite,
                    order: 1
                }
            ],
            outputOptions
        };

        return this.processImage(request);
    }

    /**
     * Optimize images for web and print output
     */
    async optimizeForOutput(
        imagePath: string,
        outputType: 'web' | 'print' | 'email'
    ): Promise<PhotoshopAsset> {
        const operations = this.getOptimizationOperations(outputType);
        const outputOptions = this.getOptimizedOutputOptions(outputType);

        const request: ImageProcessingRequest = {
            inputPath: imagePath,
            operations,
            outputOptions
        };

        return this.processImage(request);
    }

    // Private helper methods

    private async ensureAuthenticated(): Promise<void> {
        if (!this.accessToken) {
            await this.initialize();
        }
    }

    private async executeImageProcessing(request: ImageProcessingRequest): Promise<any> {
        // Phase 2: Actual Adobe Photoshop API call would go here
        // For now, return a mock result
        
        return {
            outputPath: request.inputPath.replace(/\.[^.]+$/, `_processed.${request.outputOptions.format}`),
            dimensions: { width: 1920, height: 1080, dpi: request.outputOptions.dpi },
            fileSize: 2048000 // 2MB
        };
    }

    private getDocumentEnhancementOperations(level: string): ImageOperation[] {
        const baseOperations: ImageOperation[] = [
            {
                type: 'enhance',
                parameters: {
                    autoLevels: true,
                    autoColor: true,
                    autoContrast: false,
                    sharpen: level !== 'minimal',
                    noiseReduction: level === 'maximum',
                    brightness: 0,
                    contrast: level === 'maximum' ? 10 : 0
                } as EnhanceOperation,
                order: 1
            }
        ];

        if (level === 'standard' || level === 'maximum') {
            baseOperations.push({
                type: 'resize',
                parameters: {
                    width: 1920,
                    height: 1080,
                    maintainAspectRatio: true,
                    resizeMethod: 'bicubic'
                } as ResizeOperation,
                order: 2
            });
        }

        return baseOperations;
    }

    private getOptimizationOperations(outputType: string): ImageOperation[] {
        switch (outputType) {
            case 'web':
                return [
                    {
                        type: 'resize',
                        parameters: {
                            width: 1200,
                            maintainAspectRatio: true,
                            resizeMethod: 'bicubic'
                        } as ResizeOperation,
                        order: 1
                    },
                    {
                        type: 'enhance',
                        parameters: {
                            autoLevels: true,
                            sharpen: true
                        } as EnhanceOperation,
                        order: 2
                    }
                ];
            case 'print':
                return [
                    {
                        type: 'enhance',
                        parameters: {
                            autoLevels: true,
                            autoColor: true,
                            sharpen: true
                        } as EnhanceOperation,
                        order: 1
                    }
                ];
            case 'email':
                return [
                    {
                        type: 'resize',
                        parameters: {
                            width: 800,
                            maintainAspectRatio: true,
                            resizeMethod: 'bicubic'
                        } as ResizeOperation,
                        order: 1
                    }
                ];
            default:
                return [];
        }
    }

    private getOptimizedOutputOptions(outputType: string): ImageOutputOptions {
        switch (outputType) {
            case 'web':
                return {
                    format: 'jpg',
                    quality: 85,
                    dpi: 72,
                    colorSpace: 'RGB'
                };
            case 'print':
                return {
                    format: 'tiff',
                    quality: 100,
                    dpi: 300,
                    colorSpace: 'CMYK',
                    compression: 'lzw'
                };
            case 'email':
                return {
                    format: 'jpg',
                    quality: 75,
                    dpi: 72,
                    colorSpace: 'RGB'
                };
            default:
                return {
                    format: 'png',
                    quality: 95,
                    dpi: 300,
                    colorSpace: 'RGB'
                };
        }
    }

    private calculateQualityScore(operations: ImageOperation[], outputOptions: ImageOutputOptions): number {
        let score = 50; // Base score

        // Enhancement operations increase quality
        const enhanceOps = operations.filter(op => op.type === 'enhance').length;
        score += enhanceOps * 10;

        // High DPI increases quality
        if (outputOptions.dpi >= 300) score += 20;
        else if (outputOptions.dpi >= 150) score += 10;

        // High quality setting increases score
        score += (outputOptions.quality - 50) * 0.5;

        return Math.min(100, Math.max(0, score));
    }
}

export const photoshopClient = new PhotoshopAPIClient();
