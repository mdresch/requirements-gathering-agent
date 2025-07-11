import { insertBlueParagraphInWord } from "./word-production";
import {
  convertToAdobePDF,
  convertProjectCharter,
  convertTechnicalSpec,
  convertBusinessReq,
  convertToInDesignLayout,
  generateIllustratorDiagrams,
  generateMultiFormatPackage,
  analyzeContentWithAI,
  generateSmartDiagrams,
  buildCustomTemplate,
  optimizeDocumentWithAI,
  enableRealTimeCollaboration,
  shareAIInsightsWithTeam,
  syncWithProjectManagement,
  setupDocumentWorkflow,
  enableMobileCollaboration,
  setupProgressiveWebApp,
  enableCrossPlatformSync,
  optimizeForMobileDevices,
  generateAdvancedAnalytics,
  monitorPerformanceMetrics,
  generatePredictiveInsights,
  createAnalyticsDashboard,
  deployEnterpriseIntelligence,
  enableAutomationEngine,
  integrateBusinessIntelligence,
  createEnterpriseDashboard
} from "./word";

/* global Office */

// Register the add-in commands with the Office host application.
Office.onReady(async () => {
  Office.actions.associate("action", insertBlueParagraphInWord);
  Office.actions.associate("convertToAdobePDF", convertToAdobePDF);
  Office.actions.associate("convertProjectCharter", convertProjectCharter);
  Office.actions.associate("convertTechnicalSpec", convertTechnicalSpec);
  Office.actions.associate("convertBusinessReq", convertBusinessReq);
  Office.actions.associate("convertInDesign", convertToInDesignLayout);
  Office.actions.associate("generateDiagrams", generateIllustratorDiagrams);
  Office.actions.associate("multiFormatPackage", generateMultiFormatPackage);
  Office.actions.associate("analyzeContentAI", analyzeContentWithAI);
  Office.actions.associate("generateSmartDiagrams", generateSmartDiagrams);
  Office.actions.associate("buildCustomTemplate", buildCustomTemplate);
  Office.actions.associate("optimizeDocumentAI", optimizeDocumentWithAI);
  Office.actions.associate("enableCollaboration", enableRealTimeCollaboration);
  Office.actions.associate("shareAIInsights", shareAIInsightsWithTeam);
  Office.actions.associate("syncWithProject", syncWithProjectManagement);
  Office.actions.associate("setupWorkflow", setupDocumentWorkflow);
  Office.actions.associate("enableMobileCollaboration", enableMobileCollaboration);
  Office.actions.associate("setupPWA", setupProgressiveWebApp);
  Office.actions.associate("enableCrossPlatformSync", enableCrossPlatformSync);
  Office.actions.associate("optimizeForMobile", optimizeForMobileDevices);
  Office.actions.associate("generateAdvancedAnalytics", generateAdvancedAnalytics);
  Office.actions.associate("monitorPerformance", monitorPerformanceMetrics);
  Office.actions.associate("generatePredictiveInsights", generatePredictiveInsights);
  Office.actions.associate("createAnalyticsDashboard", createAnalyticsDashboard);
  Office.actions.associate("deployEnterpriseIntelligence", deployEnterpriseIntelligence);
  Office.actions.associate("enableAutomationEngine", enableAutomationEngine);
  Office.actions.associate("integrateBusinessIntelligence", integrateBusinessIntelligence);
  Office.actions.associate("createEnterpriseDashboard", createEnterpriseDashboard);
});
