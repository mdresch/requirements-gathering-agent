#!/usr/bin/env node

/**
 * Seed Categories Script
 * Creates default categories in the database for the requirements gathering agent
 */

import mongoose from 'mongoose';
import { Category } from '../dist/models/Category.model.js';

// Database connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://mennodrescher_db_user:QueIQ4CBA@adpacluster.boafczv.mongodb.net/';
const MONGODB_DATABASE = process.env.MONGODB_DATABASE || 'requirements-gathering-agent';

// Default categories to seed
const defaultCategories = [
  {
    name: 'Business Requirements',
    description: 'High-level business needs and objectives',
    color: '#3B82F6',
    icon: '🏢',
    isActive: true,
    isSystem: true,
    createdBy: 'system'
  },
  {
    name: 'Functional Requirements',
    description: 'Specific functionality and features of the system',
    color: '#10B981',
    icon: '⚙️',
    isActive: true,
    isSystem: true,
    createdBy: 'system'
  },
  {
    name: 'Non-Functional Requirements',
    description: 'Performance, security, and quality attributes',
    color: '#F59E0B',
    icon: '🛡️',
    isActive: true,
    isSystem: true,
    createdBy: 'system'
  },
  {
    name: 'User Stories',
    description: 'User-centric requirements in story format',
    color: '#8B5CF6',
    icon: '👤',
    isActive: true,
    isSystem: true,
    createdBy: 'system'
  },
  {
    name: 'Technical Specifications',
    description: 'Technical implementation details and constraints',
    color: '#EF4444',
    icon: '🔧',
    isActive: true,
    isSystem: true,
    createdBy: 'system'
  },
  {
    name: 'Compliance & Standards',
    description: 'Regulatory and industry standard requirements',
    color: '#06B6D4',
    icon: '📋',
    isActive: true,
    isSystem: true,
    createdBy: 'system'
  },
  {
    name: 'Risk Management',
    description: 'Risk identification and mitigation requirements',
    color: '#F97316',
    icon: '⚠️',
    isActive: true,
    isSystem: true,
    createdBy: 'system'
  },
  {
    name: 'Security Requirements',
    description: 'Security policies and protection mechanisms',
    color: '#DC2626',
    icon: '🔒',
    isActive: true,
    isSystem: true,
    createdBy: 'system'
  }
];

async function connectToDatabase() {
  try {
    // Ensure we're connecting to the correct database
    let connectionUri = MONGODB_URI;
    
    // Always append the database name to ensure we connect to the right database
    if (connectionUri.endsWith('/')) {
      connectionUri = connectionUri + MONGODB_DATABASE;
    } else if (!connectionUri.includes('/')) {
      connectionUri = connectionUri + `/${MONGODB_DATABASE}`;
    } else {
      // Replace any existing database name with our target database
      const baseUri = connectionUri.split('/').slice(0, -1).join('/');
      connectionUri = `${baseUri}/${MONGODB_DATABASE}`;
    }

    console.log('🔄 Connecting to MongoDB...');
    console.log(`📍 Database: ${MONGODB_DATABASE}`);
    
    await mongoose.connect(connectionUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      w: 'majority',
      authSource: connectionUri.includes('mongodb+srv://') ? 'admin' : undefined,
    });

    console.log('✅ Connected to MongoDB successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error.message);
    return false;
  }
}

async function seedCategories() {
  try {
    console.log('🔄 Starting category seeding process...');

    // Check if categories already exist
    const existingCategories = await Category.countDocuments();
    console.log(`📊 Found ${existingCategories} existing categories`);

    if (existingCategories > 0) {
      console.log('⚠️  Categories already exist. Do you want to continue? (This will add new categories only)');
      console.log('💡 To reset categories, delete the categories collection first');
    }

    let createdCount = 0;
    let skippedCount = 0;

    for (const categoryData of defaultCategories) {
      try {
        // Check if category already exists (case-insensitive)
        const existingCategory = await Category.findOne({ 
          name: { $regex: new RegExp(`^${categoryData.name}$`, 'i') } 
        });

        if (existingCategory) {
          console.log(`⏭️  Skipping "${categoryData.name}" - already exists`);
          skippedCount++;
          continue;
        }

        // Create new category
        const category = new Category(categoryData);
        await category.save();
        
        console.log(`✅ Created category: "${categoryData.name}"`);
        createdCount++;
      } catch (error) {
        console.error(`❌ Failed to create category "${categoryData.name}":`, error.message);
      }
    }

    console.log('\n📊 Seeding Summary:');
    console.log(`✅ Created: ${createdCount} categories`);
    console.log(`⏭️  Skipped: ${skippedCount} categories`);
    console.log(`📋 Total default categories: ${defaultCategories.length}`);

    // Display all categories
    const allCategories = await Category.find({}).sort({ name: 1 });
    console.log('\n📋 All Categories in Database:');
    allCategories.forEach((cat, index) => {
      console.log(`${index + 1}. ${cat.icon} ${cat.name} (${cat.isActive ? 'Active' : 'Inactive'})`);
    });

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

async function main() {
  try {
    console.log('🌱 Category Seeding Script');
    console.log('==========================');

    // Connect to database
    const connected = await connectToDatabase();
    if (!connected) {
      process.exit(1);
    }

    // Seed categories
    await seedCategories();

    console.log('\n✅ Category seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Script failed:', error);
    process.exit(1);
  } finally {
    // Close database connection
    await mongoose.disconnect();
    console.log('📊 Disconnected from MongoDB');
  }
}

// Run the script
main().catch(console.error);