#!/usr/bin/env node

/**
 * Phase 1: Enhanced Data Integration - Enhanced Server Startup Script
 * Starts the enhanced server with real-time data integration
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Starting Enhanced ADPA API Server with Real-time Data Integration...');

// Check if we're in the right directory
const packageJsonPath = path.join(process.cwd(), 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  console.error('❌ Error: package.json not found. Please run this script from the project root.');
  process.exit(1);
}

// Set environment variables for enhanced server
process.env.NODE_ENV = 'development';
process.env.API_PORT = '3002';
process.env.WEBSOCKET_ENABLED = 'true';
process.env.REAL_TIME_ENABLED = 'true';

// Database configuration (adjust as needed)
process.env.DB_HOST = process.env.DB_HOST || 'localhost';
process.env.DB_PORT = process.env.DB_PORT || '5432';
process.env.DB_NAME = process.env.DB_NAME || 'compliance_db';
process.env.DB_USER = process.env.DB_USER || 'compliance_user';
process.env.DB_PASSWORD = process.env.DB_PASSWORD || 'compliance_password';
process.env.DB_SSL = process.env.DB_SSL || 'false';

console.log('📊 Environment Configuration:');
console.log(`   API Port: ${process.env.API_PORT}`);
console.log(`   WebSocket: ${process.env.WEBSOCKET_ENABLED}`);
console.log(`   Real-time: ${process.env.REAL_TIME_ENABLED}`);
console.log(`   Database: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);

// Build the project first
console.log('🔨 Building TypeScript project...');
const buildProcess = spawn('npm', ['run', 'build'], {
  stdio: 'inherit',
  shell: true
});

buildProcess.on('close', (code) => {
  if (code !== 0) {
    console.error('❌ Build failed. Please fix TypeScript errors before starting the server.');
    process.exit(1);
  }

  console.log('✅ Build completed successfully');
  
  // Start the Phase 1 standalone server
  console.log('🚀 Starting Phase 1 standalone server...');
  const serverProcess = spawn('node', ['dist/phase1/standalone-server.js'], {
    stdio: 'inherit',
    shell: true,
    env: process.env
  });

  serverProcess.on('close', (code) => {
    console.log(`📡 Enhanced server exited with code ${code}`);
  });

  serverProcess.on('error', (error) => {
    console.error('❌ Failed to start enhanced server:', error);
  });

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n📡 Shutting down enhanced server...');
    serverProcess.kill('SIGINT');
  });

  process.on('SIGTERM', () => {
    console.log('\n📡 Shutting down enhanced server...');
    serverProcess.kill('SIGTERM');
  });
});

buildProcess.on('error', (error) => {
  console.error('❌ Build process failed:', error);
  process.exit(1);
});
