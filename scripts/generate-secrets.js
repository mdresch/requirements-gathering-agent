#!/usr/bin/env node

/**
 * Generate secure secrets for Vercel deployment
 * Run with: node scripts/generate-secrets.js
 */

import crypto from 'crypto';

console.log('🔐 Generating secure secrets for Vercel deployment...\n');

// Generate API Key (32 characters)
const apiKey = crypto.randomBytes(16).toString('hex');
console.log('API_KEY=' + apiKey);

// Generate JWT Secret (64 characters)
const jwtSecret = crypto.randomBytes(32).toString('hex');
console.log('JWT_SECRET=' + jwtSecret);

console.log('\n📋 Copy these values to Vercel Dashboard > Settings > Environment Variables');
console.log('⚠️  Keep these secrets secure and never commit them to version control!');

console.log('\n🔗 Your MongoDB Atlas connection:');
console.log('MONGODB_URI=mongodb+srv://mennodrescher_db_user:QueIQ4CBA@adpacluster.boafczv.mongodb.net/requirements-gathering-agent?retryWrites=true&w=majority');
console.log('MONGODB_DATABASE=requirements-gathering-agent');

console.log('\n🚀 Ready for deployment!');
