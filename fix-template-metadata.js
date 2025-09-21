import mongoose from 'mongoose';

async function updateTemplate() {
  try {
    await mongoose.connect('mongodb://admin:password@localhost:27017/requirements-gathering-agent?authSource=admin');
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    const templates = db.collection('templates');
    
    const result = await templates.updateOne(
      { name: 'Business Case Template' },
      {
        $set: {
          'metadata.dependencies': [],
          'metadata.contextRequirements': [
            'projectScope',
            'businessObjectives', 
            'stakeholderAnalysis',
            'financialAnalysis',
            'riskAssessment',
            'implementationPlan'
          ],
          'contextRequirements': [
            'projectScope',
            'businessObjectives', 
            'stakeholderAnalysis',
            'financialAnalysis',
            'riskAssessment',
            'implementationPlan'
          ]
        }
      }
    );
    
    console.log('Update result:', result);
    
    const updated = await templates.findOne({ name: 'Business Case Template' });
    console.log('Context Requirements:', updated.metadata?.contextRequirements);
    console.log('Dependencies:', updated.metadata?.dependencies);
    console.log('Root Context Requirements:', updated.contextRequirements);
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

updateTemplate();
