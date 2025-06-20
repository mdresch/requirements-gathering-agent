// Example usage of the integration system

/**
 * Example 1: Convert all project charter documents
 */
async function exampleConvertProjectCharter() {
  // This would be called from a ribbon button or taskpane
  await integrateWithGeneratedDocuments(event, {
    action: "convert-category",
    environment: "mock", // or "filesystem" or "web"
    categories: ["project-charter", "basic-docs"]
  });
}

/**
 * Example 2: Convert specific documents with progress tracking
 */
async function exampleConvertWithProgress() {
  await integrateWithGeneratedDocuments(event, {
    action: "convert-files",
    filenames: [
      "project-charter.md",
      "business-case.md", 
      "risk-register.md"
    ],
    onProgress: (progress) => {
      console.log(`Converting ${progress.filename} (${progress.current}/${progress.total})`);
      // Update progress bar in taskpane UI
    }
  });
}

/**
 * Example 3: Get document catalog for UI display
 */
async function exampleGetCatalog() {
  const manager = new DocumentIntegrationManager("web", {
    apiBaseUrl: "https://your-api.com/api/generated-documents"
  });
  
  const catalog = await manager.getDocumentCatalog();
  
  console.log("Available categories:", catalog.categories);
  console.log("Total documents:", catalog.summary.totalDocuments);
  console.log("Documents by category:", catalog.documents);
  
  // This data would populate your taskpane UI
}

/**
 * Example 4: Real file system integration (Node.js)
 */
async function exampleFileSystemIntegration() {
  // In a real implementation, this would read from:
  // c:\Users\menno\Source\Repos\requirements-gathering-agent\generated-documents\
  
  const manager = new DocumentIntegrationManager("filesystem");
  const documents = await manager.getReader().readAllDocuments();
  
  // Convert all 95 documents to Word
  await integrateWithGeneratedDocuments(event, {
    action: "convert",
    environment: "filesystem"
  });
}

/**
 * Example 5: Web API integration for production
 */
async function exampleWebApiIntegration() {
  // Your API would serve the generated documents
  const manager = new DocumentIntegrationManager("web", {
    apiBaseUrl: "/api/requirements-gathering-agent/documents"
  });
  
  // Get specific category
  const requirements = await manager.getReader().readDocumentsByCategory("requirements");
  
  // Convert to Word
  await integrateWithGeneratedDocuments(event, {
    action: "convert-category",
    environment: "web",
    categories: ["requirements", "scope-management"]
  });
}

/**
 * Example API endpoint structure you'd need
 */
/*
GET /api/generated-documents/{category}
Response: 
[
  {
    "filename": "project-charter.md",
    "path": "project-charter/project-charter.md", 
    "category": "project-charter",
    "content": "# Project Charter\n\n...",
    "metadata": {
      "lastModified": "2025-06-19T10:00:00Z",
      "size": 2048
    }
  }
]

GET /api/generated-documents/file/{filename}
Response:
{
  "filename": "business-case.md",
  "path": "basic-docs/business-case.md",
  "category": "basic-docs", 
  "content": "# Business Case\n\n...",
  "metadata": {...}
}
*/

export {
  exampleConvertProjectCharter,
  exampleConvertWithProgress,
  exampleGetCatalog,
  exampleFileSystemIntegration,
  exampleWebApiIntegration
};
