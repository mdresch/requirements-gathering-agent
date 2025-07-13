import {
  insertBlueParagraphInWord,
  convertToAdobePDF,
  convertProjectCharter,
  convertTechnicalSpec,
  convertBusinessReq,
  convertInDesign,
  generateDiagrams,
  multiFormatPackage,
  analyzeContentAI,
  generateSmartDiagrams,
  buildCustomTemplate,
  optimizeDocumentAI,
  enableCollaboration,
  shareAIInsights,
  syncWithProject,
  setupWorkflow,
  generateAdvancedAnalytics,
  monitorPerformance,
  generatePredictiveInsights,
  createAnalyticsDashboard,
  enableAutomationEngine,
} from "./word";

/* global Office */

// Register the add-in commands with the Office host application.
Office.onReady(async () => {
  Office.actions.associate("action", insertBlueParagraphInWord);
  Office.actions.associate("convertToAdobePDF", convertToAdobePDF);
  Office.actions.associate("convertProjectCharter", convertProjectCharter);
  Office.actions.associate("convertTechnicalSpec", convertTechnicalSpec);
  Office.actions.associate("convertBusinessReq", convertBusinessReq);
  Office.actions.associate("convertInDesign", convertInDesign);
  Office.actions.associate("generateDiagrams", generateDiagrams);
  Office.actions.associate("multiFormatPackage", multiFormatPackage);
  Office.actions.associate("analyzeContentAI", analyzeContentAI);
  Office.actions.associate("generateSmartDiagrams", generateSmartDiagrams);
  Office.actions.associate("buildCustomTemplate", buildCustomTemplate);
  Office.actions.associate("optimizeDocumentAI", optimizeDocumentAI);
  Office.actions.associate("enableCollaboration", enableCollaboration);
  Office.actions.associate("shareAIInsights", shareAIInsights);
  Office.actions.associate("syncWithProject", syncWithProject);
  Office.actions.associate("setupWorkflow", setupWorkflow);
  Office.actions.associate("generateAdvancedAnalytics", generateAdvancedAnalytics);
  Office.actions.associate("monitorPerformance", monitorPerformance);
  Office.actions.associate("generatePredictiveInsights", generatePredictiveInsights);
  Office.actions.associate("createAnalyticsDashboard", createAnalyticsDashboard);
  Office.actions.associate("enableAutomationEngine", enableAutomationEngine);
});
