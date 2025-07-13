/*
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

/* global document, Office, Word, setTimeout, console */

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
  createAnalyticsDashboard,
  enableAutomationEngine,
} from "../commands/word";

Office.onReady((info) => {
  if (info.host === Office.HostType.Word) {
    const sideloadMsg = document.getElementById("sideload-msg");
    const appBody = document.getElementById("app-body");
    
    if (sideloadMsg) {
      sideloadMsg.style.display = "none";
    }
    
    if (appBody) {
      appBody.classList.add("app-body-visible");
      appBody.classList.remove("app-body-hidden");
    }
    
    // Bind all ADPA function buttons
    bindButtonEvents();
  }
});

function bindButtonEvents() {
  // Helper function to safely bind event handlers
  const bindButton = (id: string, func: (event: Office.AddinCommands.Event) => Promise<void>, message: string) => {
    const button = document.getElementById(id);
    if (button) {
      button.onclick = () =>
        executeFunction(
          () =>
            func({
              completed: () => {
                /* No-op for task pane execution */
              },
            } as Office.AddinCommands.Event),
          message
        );
    }
  };

  // Core Functions
  bindButton("formatDocument", insertBlueParagraphInWord, "Formatting document...");

  // PDF & Export Tools
  bindButton("convertToAdobePDF", convertToAdobePDF, "Converting to Adobe PDF...");
  bindButton("convertProjectCharter", convertProjectCharter, "Converting to Project Charter PDF...");
  bindButton("convertTechnicalSpec", convertTechnicalSpec, "Converting to Technical Specification...");
  bindButton("convertBusinessReq", convertBusinessReq, "Converting to Business Requirements...");
  bindButton("convertInDesign", convertInDesign, "Converting to InDesign Layout...");
  bindButton("multiFormatPackage", multiFormatPackage, "Creating multi-format package...");

  // AI & Smart Tools
  bindButton("analyzeContentAI", analyzeContentAI, "Analyzing content with AI...");
  bindButton("optimizeDocumentAI", optimizeDocumentAI, "Optimizing document with AI...");
  bindButton("generateDiagrams", generateDiagrams, "Generating diagrams...");
  bindButton("generateSmartDiagrams", generateSmartDiagrams, "Generating smart diagrams...");
  bindButton("buildCustomTemplate", buildCustomTemplate, "Building custom template...");

  // Collaboration Tools
  bindButton("enableCollaboration", enableCollaboration, "Enabling collaboration...");
  bindButton("shareAIInsights", shareAIInsights, "Sharing AI insights...");
  bindButton("syncWithProject", syncWithProject, "Syncing with project...");
  bindButton("setupWorkflow", setupWorkflow, "Setting up workflow...");

  // Analytics & Automation
  bindButton("generateAdvancedAnalytics", generateAdvancedAnalytics, "Generating advanced analytics...");
  bindButton("monitorPerformance", monitorPerformance, "Monitoring performance...");
  bindButton("createAnalyticsDashboard", createAnalyticsDashboard, "Creating analytics dashboard...");
  bindButton("enableAutomationEngine", enableAutomationEngine, "Enabling automation engine...");
}

async function executeFunction(func: () => Promise<void>, statusMessage: string) {
  const statusElement = document.getElementById("status-message");
  
  try {
    // Update status
    if (statusElement) {
      statusElement.textContent = statusMessage;
      statusElement.style.color = "#0078d4";
    }
    
    // Execute the function
    await func();
    
    // Success status
    if (statusElement) {
      statusElement.textContent = "Operation completed successfully";
      statusElement.style.color = "#107c10";
    }
    
    // Reset status after 3 seconds
    setTimeout(() => {
      if (statusElement) {
        statusElement.textContent = "Ready to process documents";
        statusElement.style.color = "#605e5c";
      }
    }, 3000);
  } catch (error: unknown) {
    // Error status
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    if (statusElement) {
      statusElement.textContent = `Error: ${errorMessage}`;
      statusElement.style.color = "#d13438";
    }
    
    // Reset status after 5 seconds
    setTimeout(() => {
      if (statusElement) {
        statusElement.textContent = "Ready to process documents";
        statusElement.style.color = "#605e5c";
      }
    }, 5000);
    
    console.error("ADPA Function Error:", error);
  }
}

export async function runWord() {
  return Word.run(async (context) => {
    /**
     * Insert your Word code here
     */

    // insert a paragraph at the end of the document.
    const paragraph = context.document.body.insertParagraph("Hello World", Word.InsertLocation.end);

    // change the paragraph color to blue.
    paragraph.font.color = "blue";

    await context.sync();
  });
}
