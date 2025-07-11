import { indesignClient } from './creative-suite/indesign-client.js';
import { illustratorClient } from './creative-suite/illustrator-client.js';
import { photoshopClient } from './creative-suite/photoshop-client.js';
import { documentGenerationClient } from './creative-suite/document-generation-client.js';
import { CredentialManager } from './setup-credentials.js';

export class ConnectionTester {
  private clients: {
    indesign: typeof indesignClient;
    illustrator: typeof illustratorClient;
    photoshop: typeof photoshopClient;
    docGen: typeof documentGenerationClient;
  };
  
  private credentialManager: CredentialManager;
  
  constructor() {
    this.credentialManager = new CredentialManager();
    
    const credentials = this.credentialManager.getCredentials();
    if (!credentials) {
      throw new Error('Adobe credentials not found. Run adobe:creative-setup first.');
    }
    
    this.clients = {
      indesign: indesignClient,
      illustrator: illustratorClient,
      photoshop: photoshopClient,
      docGen: documentGenerationClient
    };
  }
  
  async testAllConnections(): Promise<void> {
    console.log('🧪 Testing Adobe Creative Cloud API Connections');
    console.log('===============================================');
    
    const tests = [
      { name: 'InDesign Server', client: this.clients.indesign },
      { name: 'Illustrator', client: this.clients.illustrator },
      { name: 'Photoshop', client: this.clients.photoshop },
      { name: 'Document Generation', client: this.clients.docGen }
    ];
    
    let passedTests = 0;
    let totalTests = tests.length;
    
    for (const test of tests) {
      const success = await this.testConnection(test.name, test.client);
      if (success) passedTests++;
    }
    
    console.log('\\n📊 Test Results:');
    console.log(`✅ Passed: ${passedTests}/${totalTests}`);
    console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests}`);
    
    if (passedTests === totalTests) {
      console.log('\\n🎉 All Adobe Creative Suite APIs are ready!');
    } else {
      console.log('\\n⚠️  Some APIs need attention before proceeding.');
    }
  }
  
  private async testConnection(name: string, client: any): Promise<boolean> {
    try {
      console.log(`Testing ${name}...`);
      await client.testConnection();
      console.log(`✅ ${name} connection successful`);
      return true;
    } catch (error: any) {
      console.log(`❌ ${name} connection failed:`, error.message);
      
      // Provide helpful error guidance
      if (error.message.includes('401')) {
        console.log('  💡 Check your API credentials');
      } else if (error.message.includes('403')) {
        console.log('  💡 Check your API permissions');
      } else if (error.message.includes('ENOTFOUND')) {
        console.log('  💡 Check your network connection');
      } else if (error.message.includes('timeout')) {
        console.log('  💡 API might be temporarily unavailable');
      }
      console.log('');
      return false;
    }
  }
  
  async testSpecificAPI(apiName: 'indesign' | 'illustrator' | 'photoshop' | 'docGen'): Promise<boolean> {
    console.log(`🔍 Testing specific API: ${apiName}`);
    
    const clientMap = {
      indesign: { name: 'InDesign Server', client: this.clients.indesign },
      illustrator: { name: 'Illustrator', client: this.clients.illustrator },
      photoshop: { name: 'Photoshop', client: this.clients.photoshop },
      docGen: { name: 'Document Generation', client: this.clients.docGen }
    };
    
    const test = clientMap[apiName];
    return await this.testConnection(test.name, test.client);
  }
}

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new ConnectionTester();
  tester.testAllConnections().catch(console.error);
}
