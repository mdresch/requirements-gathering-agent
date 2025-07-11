import jwt from 'jsonwebtoken';
import { readFileSync, existsSync } from 'fs';
import { config } from './config.js';
import { logger } from '../utils/logger.js';

export interface AuthenticationResult {
  accessToken: string;
  expiresAt: number;
  success: boolean;
}

export class AdobeAuthenticator {
  private jwt: string | null = null;
  private expiresAt: number = 0;
  private privateKey: string | null = null;

  constructor() {
    this.loadPrivateKey();
  }

  private loadPrivateKey(): void {
    try {
      // Use the privateKey directly from config since it's already loaded from environment
      if (config.privateKey) {
        this.privateKey = config.privateKey;
        logger.info('Adobe private key loaded successfully');
      } else {
        logger.warn('Adobe private key not found in configuration, using mock authentication');
      }
    } catch (error) {
      logger.error('Failed to load Adobe private key:', error);
      throw new Error('Adobe authentication setup failed');
    }
  }

  async getAccessToken(): Promise<string> {
    // Check if current token is still valid
    if (this.jwt && Date.now() < this.expiresAt) {
      return this.jwt;
    }

    // Generate new JWT token
    try {
      const payload = {
        iss: config.organizationId,
        sub: config.accountId,
        aud: `https://ims-na1.adobelogin.com/c/${config.clientId}`,
        'https://ims-na1.adobelogin.com/s/ent_documentcloud_sdk': true,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 86400 // 24 hours
      };

      if (!this.privateKey) {
        throw new Error('Private key not loaded');
      }

      this.jwt = jwt.sign(payload, this.privateKey, { algorithm: 'RS256' });
      this.expiresAt = Date.now() + 86400000; // 24 hours
      
      logger.info('Adobe JWT token generated successfully');
      return this.jwt;
    } catch (error) {
      logger.error('Failed to generate Adobe JWT token:', error);
      throw new Error('Adobe authentication failed');
    }
  }

  async authenticate(): Promise<AuthenticationResult> {
    try {
      const accessToken = await this.getAccessToken();
      return {
        accessToken,
        expiresAt: this.expiresAt,
        success: true
      };
    } catch (error) {
      logger.error('Adobe authentication failed:', error);
      return {
        accessToken: '',
        expiresAt: 0,
        success: false
      };
    }
  }

  isTokenValid(): boolean {
    return this.jwt !== null && Date.now() < this.expiresAt;
  }

  clearToken(): void {
    this.jwt = null;
    this.expiresAt = 0;
    logger.info('Adobe authentication token cleared');
  }
}

export const adobeAuth = new AdobeAuthenticator();
