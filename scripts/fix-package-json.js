/**
 * Fix package.json scripts section
 */

const fs = require('fs');
const path = require('path');

// Read the current package.json
const packageJsonPath = path.join(process.cwd(), 'package.json');
let packageJson = fs.readFileSync(packageJsonPath, 'utf8');

// Create the new scripts section with the added scripts
const newScriptsSection = `  "scripts": {
    "build": "tsc && npm run copy-configs",
    "copy-configs": "node -e \\"const fs=require('fs'),path=require('path'),glob=require('glob');glob.sync('src/**/*.json').forEach(f=>{const d=f.replace('src','dist');fs.mkdirSync(path.dirname(d),{recursive:true});fs.copyFileSync(f,d);});\\"",
    "start": "node dist/server.js",
    "api:start": "node dist/server.js",
    "dev": "tsc --watch",
    "clean": "rimraf dist",
    "test": "jest",
    "test:providers": "jest --testPathPattern=providers",
    "test:performance": "jest --testPathPattern=performance",
    "test:azure": "jest --testPathPattern=azure-openai",
    "test:github": "jest --testPathPattern=github-ai",
    "test:ollama": "jest --testPathPattern=ollama",
    "test:failover": "jest --testPathPattern=failover",
    "test:unit": "jest --testPathPattern=\\"test/(?!providers).*\\\\.test\\\\.ts$\\"",
    "prepublishOnly": "npm run clean && npm run build",
    "admin:install": "cd admin-interface && npm install",
    "admin:dev": "cd admin-interface && npm run dev",
    "admin:build": "cd admin-interface && npm run build",
    "admin:start": "cd admin-interface && npm start",
    "admin:setup": "npm run admin:install && npm run admin:build",
    "admin:serve": "concurrently \\"npm run api:start\\" \\"npm run admin:start\\"",
    "confluence:init": "node dist/cli.js confluence init",
    "confluence:test": "node dist/cli.js confluence test",
    "confluence:oauth2:login": "node dist/cli.js confluence oauth2 login",
    "confluence:oauth2:status": "node dist/cli.js confluence oauth2 status",
    "confluence:oauth2:debug": "node dist/cli.js confluence oauth2 debug",
    "confluence:publish": "node dist/cli.js confluence publish",
    "confluence:status": "node dist/cli.js confluence status",
    "sharepoint:init": "node dist/cli.js sharepoint init",
    "sharepoint:test": "node dist/cli.js sharepoint test",
    "sharepoint:oauth2:login": "node dist/cli.js sharepoint oauth2 login",
    "sharepoint:oauth2:status": "node dist/cli.js sharepoint oauth2 status",
    "sharepoint:oauth2:debug": "node dist/cli.js sharepoint oauth2 debug",
    "sharepoint:publish": "node dist/cli.js sharepoint publish",
    "sharepoint:status": "node dist/cli.js sharepoint status",
    "api:compile": "tsp compile api-specs/consolidated-api.tsp --output-dir api-specs/generated",
    "api:watch": "tsp compile api-specs --watch",
    "api:format": "tsp format api-specs/**/*.tsp",
    "api:lint": "tsp compile api-specs --no-emit",
    "api:docs": "redoc-cli build api-specs/generated/openapi/adpa-api.yaml --output docs/api/index.html",
    "api:serve-docs": "redoc-cli serve api-specs/generated/openapi/adpa-api.yaml --port 8080",
    "api:demo": "node demo/typespec-demo.js",
    "api:server": "node dist/server.js",
    "babok:generate": "node dist/server.js --framework=babok",
    "pmbok:generate": "node dist/server.js --framework=pmbok",
    "dmbok:generate": "node dist/server.js --framework=dmbok",
    "framework:multi": "node dist/server.js --framework=multi",
    "validate-providers": "node validate-providers.js",
    "setup-gemini-cli": "node scripts/setup-gemini-cli-v2.js",
    "gemini:setup": "node scripts/setup-gemini-cli-v2.js",
    "gemini:setup-simple": "node scripts/setup-gemini-cli-simple.js",
    "gemini:test": "node validate-providers.js --provider gemini-cli",
    "adobe:demo": "node examples/adobe-integration-demo.js",
    "adobe:demo-generation": "node scripts/demo-adobe-generation.js",
    "adobe:example-basic": "node examples/adobe-basic-example-working.js",
    "adobe:example-real": "node examples/adobe-real-pdf-example.js",
    "adobe:example-fixed": "node examples/adobe-sdk-fixed-example.js",
    "adobe:ultimate-fix": "node examples/adobe-ultimate-fix.js",
    "adobe:debug-credentials": "node examples/adobe-debug-credentials.js",
    "adobe:env-var-method": "node examples/adobe-env-var-method.js",
    "adobe:example-production": "node examples/adobe-production-example.js",
    "adobe:health-check": "node examples/adobe-production-example.js --health-check",
    "adobe:test": "jest --testPathPattern=adobe",
    "adobe:setup": "node scripts/setup-adobe-integration.js",
    "adobe:validate": "node scripts/validate-adobe-simple.js",
    "adobe:migrate-real": "node scripts/migrate-to-real-adobe.js",
    "adobe:setup-real": "node scripts/setup-real-adobe-credentials.js",
    "adobe:validate-real": "node scripts/validate-real-adobe-migration.js",
    "adobe:test-real": "jest --testPathPattern=adobe.*real",
    "adobe:test-auth": "node scripts/test-adobe-auth.js",
    "adobe:test-auth-simple": "node scripts/test-adobe-auth-simple.js",
    "adobe:test-auth-working": "node scripts/test-adobe-auth-working.js",
    "adobe:health-check-real": "node scripts/adobe-health-check.js",
    "adobe:generate-pdf": "node examples/adobe-real-pdf-generator.cjs",
    "adobe:generate-direct": "node examples/adobe-direct-api-generator.cjs",
    "adobe:generate-working": "node examples/adobe-working-pdf-generator.cjs",
    "adobe:complete-solution": "node examples/adobe-complete-pdf-solution.cjs",
    "adobe:generate-puppeteer": "node scripts/generate-pdf-puppeteer.cjs",
    "batch:convert-docs": "node scripts/batch-convert-generated-docs.js",
    "batch:convert-simple": "node scripts/simple-batch-pdf-converter.js",
    "adobe:setup-creative": "node scripts/setup-adobe-creative-suite.js",
    "adobe:phase2:init": "node scripts/setup-adobe-creative-suite.js",
    "adobe:phase2:demo": "node -e \\"import('./src/adobe/creative-suite/index.js').then(m => m.adobeCreativeSuite.runDemo())\\"",
    "adobe:phase2:capabilities": "node -e \\"import('./src/adobe/creative-suite/index.js').then(m => m.adobeCreativeSuite.getCapabilities().then(c => console.log(JSON.stringify(c, null, 2))))\\"",
    "adobe:phase2:validate": "node -e \\"import('./src/adobe/creative-suite/index.js').then(m => m.adobeCreativeSuite.validateConfiguration().then(v => console.log(JSON.stringify(v, null, 2))))\\"",
    "adobe:phase2:templates": "node -e \\"import('./src/adobe/creative-suite/index.js').then(m => m.adobeCreativeSuite.getAvailableTemplates().then(t => console.log(JSON.stringify(t, null, 2))))\\"",
    "adobe:validate-creative-credentials": "node scripts/validate-adobe-creative-credentials.js",
    "adobe:test-api-connectivity": "node -e \\"import('./src/adobe/creative-suite/authenticator.js').then(m => m.creativeSuiteAuth.testAPIConnectivity().then(r => console.log(JSON.stringify(r, null, 2))))\\"",
    "adobe:validate-creative-config": "node -e \\"import('./src/adobe/creative-suite/config.js').then(m => console.log(JSON.stringify(m.creativeSuiteConfig.validateConfiguration(), null, 2)))\\"",
    "setup:config": "node scripts/setup-config.js",
    "setup:env": "node scripts/setup-env.js",
    "setup:full": "npm run setup:config && npm run setup:env"
  },`;

// Replace the scripts section in package.json
// This regex matches the entire scripts section including the opening and closing braces
const scriptsRegex = /"scripts"\s*:\s*\{[\s\S]*?\},/;
const fixedPackageJson = packageJson.replace(scriptsRegex, newScriptsSection);

// Write the fixed package.json back to disk
fs.writeFileSync(packageJsonPath, fixedPackageJson);
console.log('package.json scripts section has been fixed.');
