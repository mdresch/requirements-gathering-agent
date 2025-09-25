import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DATABASE = process.env.MONGODB_DATABASE || 'requirements-gathering-agent';

class FeedbackSeeder {
  constructor() {
    this.client = new MongoClient(MONGODB_URI);
    this.db = null;
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    console.log(`${type === 'info' ? 'ℹ️' : '✅'} [${timestamp}] ${message}`);
  }

  async connect() {
    try {
      // Ensure we connect to the correct database
      let connectionUri = MONGODB_URI;
      if (connectionUri.endsWith('/')) {
        connectionUri = connectionUri + MONGODB_DATABASE;
      } else if (!connectionUri.includes('/')) {
        connectionUri = connectionUri + `/${MONGODB_DATABASE}`;
      } else {
        const baseUri = connectionUri.split('/').slice(0, -1).join('/');
        connectionUri = `${baseUri}/${MONGODB_DATABASE}`;
      }
      
      await this.client.connect(connectionUri);
      this.db = this.client.db(MONGODB_DATABASE);
      this.log(`Connected to Atlas successfully - Database: ${MONGODB_DATABASE}`, 'success');
    } catch (error) {
      this.log(`Failed to connect to Atlas: ${error.message}`, 'error');
      throw error;
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.close();
      this.log('Connection closed');
    }
  }

  async getExistingProjects() {
    try {
      const projects = await this.db.collection('projects').find({}).limit(10).toArray();
      this.log(`Found ${projects.length} existing projects`);
      return projects;
    } catch (error) {
      this.log(`Error fetching projects: ${error.message}`, 'error');
      return [];
    }
  }

  async getExistingDocuments() {
    try {
      const documents = await this.db.collection('projectdocuments').find({}).limit(20).toArray();
      this.log(`Found ${documents.length} existing documents`);
      return documents;
    } catch (error) {
      this.log(`Error fetching documents: ${error.message}`, 'error');
      return [];
    }
  }

  async seedFeedback() {
    this.log('Starting feedback data seeding...');
    
    const projects = await this.getExistingProjects();
    const documents = await this.getExistingDocuments();
    
    if (projects.length === 0 || documents.length === 0) {
      this.log('No projects or documents found. Creating sample data first...');
      return;
    }

    const feedbackData = [];
    const feedbackTypes = ['quality', 'accuracy', 'completeness', 'clarity', 'usability'];
    const priorities = ['low', 'medium', 'high', 'critical'];
    const statuses = ['pending', 'in_progress', 'resolved', 'closed'];
    
    // Generate feedback for different documents
    for (let i = 0; i < 25; i++) {
      const randomProject = projects[Math.floor(Math.random() * projects.length)];
      const randomDocument = documents[Math.floor(Math.random() * documents.length)];
      const randomType = feedbackTypes[Math.floor(Math.random() * feedbackTypes.length)];
      const randomPriority = priorities[Math.floor(Math.random() * priorities.length)];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      const rating = Math.floor(Math.random() * 5) + 1; // 1-5 rating
      
      const feedback = {
        _id: new mongoose.Types.ObjectId(),
        projectId: randomProject._id,
        documentId: randomDocument._id,
        documentType: randomDocument.type || 'business-case',
        userId: new mongoose.Types.ObjectId(), // Anonymous user
        rating: rating,
        feedbackType: randomType,
        title: this.generateFeedbackTitle(randomType, randomDocument.name),
        description: this.generateFeedbackDescription(randomType, randomDocument.name, rating),
        priority: randomPriority,
        status: randomStatus,
        suggestedImprovement: this.generateImprovement(randomType, rating),
        submittedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Last 30 days
        updatedAt: new Date(),
        createdAt: new Date()
      };
      
      feedbackData.push(feedback);
    }

    try {
      const collection = this.db.collection('feedback');
      await collection.insertMany(feedbackData);
      this.log(`Inserted ${feedbackData.length} feedback items`, 'success');
      
      // Also seed some document feedback specifically
      await this.seedDocumentFeedback(documents);
      
    } catch (error) {
      this.log(`Failed to seed feedback: ${error.message}`, 'error');
    }
  }

  async seedDocumentFeedback(documents) {
    this.log('Seeding document-specific feedback...');
    
    const documentFeedbackData = [];
    
    // Create specific feedback for each document type
    const documentTypes = ['business-case', 'project-charter', 'user-stories', 'risk-assessment', 'test-plan'];
    
    for (const docType of documentTypes) {
      const matchingDocs = documents.filter(doc => doc.type === docType);
      if (matchingDocs.length > 0) {
        const doc = matchingDocs[0];
        
        // Create 2-3 feedback items per document type
        for (let i = 0; i < Math.floor(Math.random() * 2) + 2; i++) {
          const rating = Math.floor(Math.random() * 3) + 3; // 3-5 rating for better quality
          const feedbackType = ['quality', 'completeness', 'clarity'][Math.floor(Math.random() * 3)];
          
          const docFeedback = {
            _id: new mongoose.Types.ObjectId(),
            projectId: doc.projectId,
            documentId: doc._id,
            documentType: docType,
            userId: new mongoose.Types.ObjectId(),
            rating: rating,
            feedbackType: feedbackType,
            title: `${docType.replace('-', ' ')} ${feedbackType} feedback`,
            description: this.generateDocumentSpecificFeedback(docType, feedbackType, rating),
            priority: rating <= 3 ? 'high' : rating === 4 ? 'medium' : 'low',
            status: 'resolved',
            suggestedImprovement: this.generateDocumentImprovement(docType, feedbackType),
            submittedAt: new Date(Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000), // Last 15 days
            updatedAt: new Date(),
            createdAt: new Date()
          };
          
          documentFeedbackData.push(docFeedback);
        }
      }
    }

    try {
      const collection = this.db.collection('feedback');
      await collection.insertMany(documentFeedbackData);
      this.log(`Inserted ${documentFeedbackData.length} document-specific feedback items`, 'success');
    } catch (error) {
      this.log(`Failed to seed document feedback: ${error.message}`, 'error');
    }
  }

  generateFeedbackTitle(type, documentName) {
    const titles = {
      quality: `Quality issues in ${documentName}`,
      accuracy: `Accuracy concerns for ${documentName}`,
      completeness: `Missing information in ${documentName}`,
      clarity: `Clarity improvements needed for ${documentName}`,
      usability: `Usability feedback for ${documentName}`
    };
    return titles[type] || `General feedback for ${documentName}`;
  }

  generateFeedbackDescription(type, documentName, rating) {
    const descriptions = {
      quality: rating <= 2 ? 
        `The ${documentName} document has several quality issues that need immediate attention. The content lacks depth and professional standards.` :
        rating <= 3 ?
        `The ${documentName} document is acceptable but could benefit from quality improvements in several areas.` :
        `The ${documentName} document demonstrates good quality with minor areas for enhancement.`,
      
      accuracy: rating <= 2 ?
        `There are factual inaccuracies in the ${documentName} that could lead to project issues.` :
        rating <= 3 ?
        `Most information in ${documentName} is accurate, but some details need verification.` :
        `The ${documentName} appears to be factually accurate and well-researched.`,
      
      completeness: rating <= 2 ?
        `The ${documentName} is missing critical sections and information needed for project success.` :
        rating <= 3 ?
        `The ${documentName} covers most requirements but lacks some important details.` :
        `The ${documentName} provides comprehensive coverage of the required information.`,
      
      clarity: rating <= 2 ?
        `The ${documentName} is difficult to understand and needs significant clarification.` :
        rating <= 3 ?
        `The ${documentName} is mostly clear but some sections could be better explained.` :
        `The ${documentName} is well-written and easy to understand.`,
      
      usability: rating <= 2 ?
        `The ${documentName} is not user-friendly and needs major usability improvements.` :
        rating <= 3 ?
        `The ${documentName} is functional but could be more user-friendly.` :
        `The ${documentName} is well-structured and easy to use.`
    };
    return descriptions[type] || `General feedback for ${documentName}`;
  }

  generateImprovement(type, rating) {
    const improvements = {
      quality: rating <= 2 ? 
        'Implement quality gates and review processes to ensure higher standards.' :
        'Continue current quality practices with minor enhancements.',
      
      accuracy: rating <= 2 ?
        'Establish fact-checking procedures and validation processes.' :
        'Maintain current accuracy standards with periodic reviews.',
      
      completeness: rating <= 2 ?
        'Create comprehensive checklists to ensure all required sections are included.' :
        'Add minor enhancements to cover any remaining gaps.',
      
      clarity: rating <= 2 ?
        'Provide writing guidelines and templates to improve clarity.' :
        'Continue current clear communication practices.',
      
      usability: rating <= 2 ?
        'Redesign document structure and formatting for better usability.' :
        'Make minor usability improvements to enhance user experience.'
    };
    return improvements[type] || 'Consider general improvements based on user feedback.';
  }

  generateDocumentSpecificFeedback(docType, feedbackType, rating) {
    const docNames = {
      'business-case': 'Business Case',
      'project-charter': 'Project Charter',
      'user-stories': 'User Stories',
      'risk-assessment': 'Risk Assessment',
      'test-plan': 'Test Plan'
    };
    
    const docName = docNames[docType] || docType;
    
    if (feedbackType === 'quality') {
      return rating <= 3 ? 
        `The ${docName} document needs significant quality improvements. The content lacks professional depth and requires better structure.` :
        `The ${docName} document demonstrates good quality with professional standards and clear structure.`;
    } else if (feedbackType === 'completeness') {
      return rating <= 3 ?
        `The ${docName} is missing several important sections that are critical for project success.` :
        `The ${docName} provides comprehensive coverage of all necessary information.`;
    } else if (feedbackType === 'clarity') {
      return rating <= 3 ?
        `The ${docName} could be clearer in its presentation and explanation of key concepts.` :
        `The ${docName} is well-written and easy to understand for all stakeholders.`;
    }
    
    return `General feedback for the ${docName} document.`;
  }

  generateDocumentImprovement(docType, feedbackType) {
    const improvements = {
      'business-case': 'Enhance financial analysis and ROI calculations with more detailed metrics.',
      'project-charter': 'Add more specific success criteria and stakeholder engagement details.',
      'user-stories': 'Include more detailed acceptance criteria and user scenarios.',
      'risk-assessment': 'Provide more specific mitigation strategies and contingency plans.',
      'test-plan': 'Add more comprehensive test scenarios and validation procedures.'
    };
    
    return improvements[docType] || 'Consider general improvements based on document type requirements.';
  }

  async run() {
    try {
      await this.connect();
      await this.seedFeedback();
      
      // Verify the seeded data
      this.log('Verifying seeded feedback data...');
      const feedbackCount = await this.db.collection('feedback').countDocuments();
      this.log(`📊 Total feedback items: ${feedbackCount}`);
      
      // Show some statistics
      const avgRating = await this.db.collection('feedback').aggregate([
        { $group: { _id: null, avgRating: { $avg: '$rating' } } }
      ]).toArray();
      
      if (avgRating.length > 0) {
        this.log(`⭐ Average rating: ${avgRating[0].avgRating.toFixed(2)}/5`);
      }
      
      const ratingDistribution = await this.db.collection('feedback').aggregate([
        { $group: { _id: '$rating', count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]).toArray();
      
      this.log('📈 Rating distribution:');
      ratingDistribution.forEach(rating => {
        this.log(`   ${rating._id} stars: ${rating.count} feedback items`);
      });
      
      this.log(`Feedback seeding completed! Seeded ${feedbackCount} feedback items`, 'success');
      this.log('Sample feedback includes:');
      this.log('📝 Quality, accuracy, completeness, clarity, and usability feedback');
      this.log('⭐ Ratings from 1-5 stars with realistic distribution');
      this.log('🎯 Different priority levels (low, medium, high, critical)');
      this.log('📊 Various statuses (pending, in_progress, resolved, closed)');
      this.log('💡 Specific improvement suggestions for each document type');
      
    } catch (error) {
      this.log(`Error during feedback seeding: ${error.message}`, 'error');
    } finally {
      await this.disconnect();
    }
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const seeder = new FeedbackSeeder();
  seeder.run();
}
