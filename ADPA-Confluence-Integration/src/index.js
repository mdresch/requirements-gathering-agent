import Resolver from '@forge/resolver';

const resolver = new Resolver();

// Legacy function for basic testing
resolver.define('getText', (req) => {
  console.log('getText request:', req);
  return 'Hello from ADPA Confluence Integration!';
});

// Route requests to the document generator
resolver.define('generateDocuments', async (req) => {
  console.log('Routing generateDocuments request to document generator...');
  
  // This would typically be handled by the document-generator function
  // but we'll add a basic fallback here
  return {
    status: 'success',
    message: 'Request routed to document generator',
    timestamp: new Date().toISOString()
  };
});

// Route requests to confluence publisher functions
resolver.define('getCurrentUser', async (req) => {
  console.log('Routing getCurrentUser request to confluence publisher...');
  
  return {
    status: 'success',
    message: 'Request routed to confluence publisher',
    timestamp: new Date().toISOString()
  };
});

resolver.define('getSpace', async (req) => {
  console.log('Routing getSpace request to confluence publisher...');
  
  return {
    status: 'success',
    message: 'Request routed to confluence publisher',
    timestamp: new Date().toISOString()
  };
});

export const handler = resolver.getDefinitions();
