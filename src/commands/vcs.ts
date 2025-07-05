/**
 * VCS (Version Control System) Command Handler
 * Handles version control system integration for generated documents
 */

// 1. Node.js built-ins
import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

// 2. Third-party dependencies (none in this file)

// 3. Internal modules (none in this file)

// 4. Constants
import { DEFAULT_OUTPUT_DIR } from '../constants.js';

export interface VcsInitOptions {
  outputDir?: string;
  quiet?: boolean;
}

export interface VcsCommitOptions {
  outputDir?: string;
  message?: string;
  quiet?: boolean;
}

export interface VcsStatusOptions {
  outputDir?: string;
  quiet?: boolean;
}

export interface VcsPushOptions {
  outputDir?: string;
  remote?: string;
  branch?: string;
  quiet?: boolean;
}

/**
 * Handler for 'vcs init' command
 */
export async function handleVcsInitCommand(options: VcsInitOptions = {}): Promise<void> {
  const { outputDir = DEFAULT_OUTPUT_DIR, quiet } = options;
  
  if (!quiet) {
    console.log(`🔧 Initializing Git repository in ${outputDir}...`);
  }
  
  await ensureGitRepoInitialized(outputDir);
  
  if (!quiet) {
    console.log('✅ Git repository initialized');
  }
}

/**
 * Handler for 'vcs status' command
 */
export async function handleVcsStatusCommand(options: VcsStatusOptions = {}): Promise<void> {
  const { outputDir = DEFAULT_OUTPUT_DIR, quiet } = options;
  
  const repoPath = join(process.cwd(), outputDir);
  const gitDir = join(repoPath, '.git');
  
  if (!existsSync(gitDir)) {
    if (!quiet) {
      console.log('❌ No Git repository found in output directory');
      console.log('💡 Run: rga vcs init');
    }
    return;
  }
  
  if (!quiet) {
    console.log(`📊 Git status for ${outputDir}:`);
  }
  
  try {
    execSync('git status --porcelain', { 
      cwd: repoPath, 
      stdio: quiet ? 'ignore' : 'inherit' 
    });
  } catch (error) {
    if (!quiet) {
      console.error('❌ Failed to get Git status:', error);
    }
    throw error;
  }
}

/**
 * Handler for 'vcs commit' command
 */
export async function handleVcsCommitCommand(options: VcsCommitOptions = {}): Promise<void> {
  const { outputDir = DEFAULT_OUTPUT_DIR, message = 'Update generated documents', quiet } = options;
  
  const repoPath = join(process.cwd(), outputDir);
  const gitDir = join(repoPath, '.git');
  
  if (!existsSync(gitDir)) {
    if (!quiet) {
      console.log('❌ No Git repository found in output directory');
      console.log('💡 Run: rga vcs init');
    }
    return;
  }
  
  if (!quiet) {
    console.log(`📝 Committing changes in ${outputDir}...`);
  }
  
  try {
    // Add all changes
    execSync('git add .', { 
      cwd: repoPath, 
      stdio: quiet ? 'ignore' : 'inherit' 
    });
    
    // Check if there are any changes to commit
    try {
      execSync('git diff --cached --exit-code', { 
        cwd: repoPath, 
        stdio: 'ignore' 
      });
      
      if (!quiet) {
        console.log('ℹ️  No changes to commit');
      }
      return;
    } catch {
      // Changes exist, continue with commit
    }
    
    // Commit changes
    execSync(`git commit -m "${message}"`, { 
      cwd: repoPath, 
      stdio: quiet ? 'ignore' : 'inherit' 
    });
    
    if (!quiet) {
      console.log('✅ Changes committed successfully');
    }
  } catch (error) {
    if (!quiet) {
      console.error('❌ Failed to commit changes:', error);
    }
    throw error;
  }
}

/**
 * Handler for 'vcs push' command
 */
export async function handleVcsPushCommand(options: VcsPushOptions = {}): Promise<void> {
  const { outputDir = DEFAULT_OUTPUT_DIR, remote = 'origin', branch = 'main', quiet } = options;
  
  const repoPath = join(process.cwd(), outputDir);
  const gitDir = join(repoPath, '.git');
  
  if (!existsSync(gitDir)) {
    if (!quiet) {
      console.log('❌ No Git repository found in output directory');
      console.log('💡 Run: rga vcs init');
    }
    return;
  }
  
  if (!quiet) {
    console.log(`🚀 Pushing changes to ${remote}/${branch}...`);
  }
  
  try {
    execSync(`git push ${remote} ${branch}`, { 
      cwd: repoPath, 
      stdio: quiet ? 'ignore' : 'inherit' 
    });
    
    if (!quiet) {
      console.log('✅ Changes pushed successfully');
    }
  } catch (error) {
    if (!quiet) {
      console.error('❌ Failed to push changes:', error);
    }
    throw error;
  }
}

/**
 * Utility function to ensure Git repository is initialized
 */
async function ensureGitRepoInitialized(documentsDir: string = DEFAULT_OUTPUT_DIR): Promise<void> {
  const repoPath = join(process.cwd(), documentsDir);
  const gitDir = join(repoPath, '.git');
  
  if (!existsSync(gitDir)) {
    console.log(`Initializing git repository in ${documentsDir}/ ...`);
    try {
      execSync('git init', { cwd: repoPath, stdio: 'inherit' });
      console.log('✅ Git repository initialized.');
    } catch (e) {
      console.error('❌ Failed to initialize git repository:', e);
      throw e;
    }
  }
}
