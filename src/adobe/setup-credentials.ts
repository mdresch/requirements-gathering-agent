import * as fs from 'fs';
import * as path from 'path';
import { config } from 'dotenv';

config();

export interface AdobeCredentials {
  clientId: string;
  clientSecret: string;
  organizationId: string;
  technicalAccountId: string;
  privateKey: string;
  publicKeyId: string;
}

export class CredentialManager {
  private credentialsPath = path.join(process.cwd(), '.env');
  
  async setupCredentials(): Promise<void> {
    console.log('🔧 Adobe Creative Cloud API Credential Setup');
    console.log('=====================================');
    
    // Check if credentials already exist
    if (this.hasExistingCredentials()) {
      console.log('✅ Existing credentials found');
      return this.validateCredentials();
    }
    
    // Guide user through credential setup
    console.log('📋 Please follow these steps to set up Adobe API credentials:');
    console.log('1. Visit https://developer.adobe.com/console');
    console.log('2. Create a new project or select existing');
    console.log('3. Add Creative SDK API');
    console.log('4. Generate service account credentials');
    console.log('');
    
    // Create template .env file
    this.createCredentialsTemplate();
    
    console.log('🔧 Template .env file created. Please update with your credentials.');
  }
  
  private hasExistingCredentials(): boolean {
    return fs.existsSync(this.credentialsPath) && 
           process.env.ADOBE_CLIENT_ID !== undefined;
  }
  
  private async validateCredentials(): Promise<void> {
    const required = [
      'ADOBE_CLIENT_ID',
      'ADOBE_CLIENT_SECRET',
      'ADOBE_ORGANIZATION_ID',
      'ADOBE_TECHNICAL_ACCOUNT_ID'
    ];
    
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
      console.log('❌ Missing required credentials:');
      missing.forEach(key => console.log(`  - ${key}`));
      process.exit(1);
    }
    
    console.log('✅ All required credentials are present');
  }
  
  private createCredentialsTemplate(): void {
    const template = `# Adobe Creative Cloud API Credentials
# Get these from https://developer.adobe.com/console

ADOBE_CLIENT_ID=your_client_id_here
ADOBE_CLIENT_SECRET=your_client_secret_here
ADOBE_ORGANIZATION_ID=your_organization_id_here
ADOBE_TECHNICAL_ACCOUNT_ID=your_technical_account_id_here
ADOBE_PRIVATE_KEY_PATH=./private.key
ADOBE_PUBLIC_KEY_ID=your_public_key_id_here

# Optional: Template and asset paths
ADOBE_TEMPLATES_PATH=./src/adobe/templates
ADOBE_ASSETS_PATH=./src/adobe/assets
ADOBE_OUTPUT_PATH=./output/adobe-enhanced
`;
    
    fs.writeFileSync(this.credentialsPath, template);
    console.log(`📝 Template credentials file created at: ${this.credentialsPath}`);
  }
  
  getCredentials(): AdobeCredentials | null {
    if (!this.hasExistingCredentials()) {
      return null;
    }
    
    return {
      clientId: process.env.ADOBE_CLIENT_ID!,
      clientSecret: process.env.ADOBE_CLIENT_SECRET!,
      organizationId: process.env.ADOBE_ORGANIZATION_ID!,
      technicalAccountId: process.env.ADOBE_TECHNICAL_ACCOUNT_ID!,
      privateKey: process.env.ADOBE_PRIVATE_KEY || '',
      publicKeyId: process.env.ADOBE_PUBLIC_KEY_ID || ''
    };
  }
}

// Run setup if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const manager = new CredentialManager();
  manager.setupCredentials().catch(console.error);
}
