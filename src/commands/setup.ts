/**
 * Setup Command Handler
 * Interactive setup wizard for AI providers
 */

import { promises as fs } from 'fs';
import { join } from 'path';
import readline from 'readline/promises';
import { execSync } from 'child_process';
import {
  CONFIG_FILENAME,
  PROCESSOR_CONFIG_FILENAME
} from '../constants.js';

/**
 * Run the enhanced setup wizard for configuring AI providers
 */
export async function handleSetupCommand() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const cwd = process.cwd();
  console.log('🧙‍♂️ Interactive Setup Wizard\n');

  async function ask(question: string): Promise<string> {
    const answer = await rl.question(question);
    return answer.trim();
  }

  // Choose provider
  const provider = await ask('Select AI provider (google/azure/github/ollama): ');
  let envVars: Record<string, string> = {};
  switch (provider.toLowerCase()) {
    case 'google':
      envVars = {
        GOOGLE_AI_API_KEY: await ask('Enter your Google AI API Key: '),
        GOOGLE_AI_MODEL: await ask('Enter Google AI Model (default: gemini-1.5-flash): ') || 'gemini-1.5-flash'
      };
      break;
    case 'azure':
      envVars = {
        AZURE_OPENAI_ENDPOINT: await ask('Enter your Azure OpenAI Endpoint: '),
        DEPLOYMENT_NAME: await ask('Enter Azure deployment name (default: gpt-4): ') || 'gpt-4',
        USE_ENTRA_ID: await ask('Use Entra ID? (true/false, default: false): ') || 'false',
        AZURE_AI_API_KEY: await ask('Enter Azure API Key (optional, press enter to skip): ')
      };
      break;
    case 'github':
      envVars = {
        GITHUB_TOKEN: await ask('Enter your GitHub AI Token: '),
        GITHUB_ENDPOINT: await ask('Enter GitHub AI Endpoint (default: https://models.github.ai/inference/): ') || 'https://models.github.ai/inference/',
        REQUIREMENTS_AGENT_MODEL: await ask('Enter model (default: gpt-4o-mini): ') || 'gpt-4o-mini'
      };
      break;
    case 'ollama':
      envVars = {
        OLLAMA_ENDPOINT: await ask('Enter Ollama endpoint (default: http://localhost:11434): ') || 'http://localhost:11434',
        REQUIREMENTS_AGENT_MODEL: await ask('Enter model (default: llama3.1): ') || 'llama3.1'
      };
      break;
    default:
      console.log('Unknown provider. Exiting setup.');
      rl.close();
      process.exit(1);
  }

  // Merge new envVars into existing .env file
  const envPath = join(cwd, '.env');
  let existingEnv: string = '';
  try {
    existingEnv = await fs.readFile(envPath, 'utf-8');
  } catch {}
  const envLines = existingEnv.split(/\r?\n/);
  const envMap = new Map<string, string>();
  for (const line of envLines) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (match) envMap.set(match[1], match[2]);
  }
  for (const [k, v] of Object.entries(envVars)) {
    if (v) envMap.set(k, v);
  }
  // Reconstruct .env file, preserving comments and order
  const updatedEnv: string[] = [];
  for (const line of envLines) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (match) {
      updatedEnv.push(`${match[1]}=${envMap.get(match[1])}`);
      envMap.delete(match[1]);
    } else {
      updatedEnv.push(line);
    }
  }
  // Add any new keys
  for (const [k, v] of envMap.entries()) {
    updatedEnv.push(`${k}=${v}`);
  }
  try {
    await fs.writeFile(envPath, updatedEnv.join('\n'), { encoding: 'utf-8' });
    console.log('\n✅ .env file created/updated.');
  } catch (e) {
    console.error('❌ Failed to write .env:', e);
  }

  // Optionally update config-rga.json
  const updateConfig = (await ask('Update config-rga.json with provider/model? (y/n): ')).toLowerCase() === 'y';
  if (updateConfig) {
    try {
      const configPath = join(cwd, CONFIG_FILENAME);
      const configRaw = await fs.readFile(configPath, 'utf-8');
      const config = JSON.parse(configRaw);
      config.currentProvider = provider + (provider.endsWith('-ai') ? '' : '-ai');
      if (!config.providers) config.providers = {};
      config.providers[config.currentProvider] = { model: envVars.REQUIREMENTS_AGENT_MODEL || envVars.GOOGLE_AI_MODEL || envVars.DEPLOYMENT_NAME || '' };
      await fs.writeFile(configPath, JSON.stringify(config, null, 2), { encoding: 'utf-8' });
      console.log('✅ config-rga.json updated.');
    } catch (e) {
      console.error('❌ Failed to update config-rga.json:', e);
    }
  }

  // Optionally update processor-config.json
  const updateProc = (await ask('Update processor-config.json (for advanced users)? (y/n): ')).toLowerCase() === 'y';
  if (updateProc) {
    try {
      const procPath = join(cwd, PROCESSOR_CONFIG_FILENAME);
      let procConfig = {};
      try {
        const procRaw = await fs.readFile(procPath, 'utf-8');
        procConfig = JSON.parse(procRaw);
      } catch {}
      // Example: add a timestamp or note
      (procConfig as any)['lastSetup'] = new Date().toISOString();
      await fs.writeFile(procPath, JSON.stringify(procConfig, null, 2), { encoding: 'utf-8' });
      console.log('✅ processor-config.json updated.');
    } catch (e) {
      console.error('❌ Failed to update processor-config.json:', e);
    }
  }

  // Offer to run npm install
  const doInstall = (await ask('Run npm install now? (y/n): ')).toLowerCase() === 'y';
  if (doInstall) {
    try {
      execSync('npm install', { stdio: 'inherit' });
      console.log('✅ npm install complete.');
    } catch (e) {
      console.error('❌ npm install failed:', e);
    }
  }

  // Offer to run build
  const doBuild = (await ask('Run npm run build now? (y/n): ')).toLowerCase() === 'y';
  if (doBuild) {
    try {
      execSync('npm run build', { stdio: 'inherit' });
      console.log('✅ Build complete.');
    } catch (e) {
      console.error('❌ Build failed:', e);
    }
  }

  await rl.close();
  console.log('\nSetup complete. You may now use the CLI.');
}

