/**
 * Diagram Parser - Enhanced Phase 2 Implementation with Phase 3 Interactive Features
 * Intelligent diagram extraction with timeline and Gantt chart support
 * Interactive features for timeline and Gantt charts
 */

/* global console */
import { TimelineGanttParser } from "./phase2-timeline-gantt";
import { 
  InteractiveTimelineService, 
  InteractiveOptions, 
  InteractiveConfig,
  TimelineEvent,
  GanttTask,
  EventHandlers
} from "./phase3-interactive";

interface DiagramData {
  type: "mermaid" | "plantuml" | "text-flow" | "org-chart" | "timeline" | "gantt-chart";
  content: string;
  title?: string;
  position?: number;
  originalText: string;
  // Phase 3: Interactive properties
  interactive?: boolean;
  interactiveOptions?: InteractiveOptions;
}

interface ParseResult {
  success: boolean;
  diagrams: DiagramData[];
  errors: string[];
  // Phase 3: Interactive features
  interactiveFeatures?: {
    timelineEvents: TimelineEvent[];
    ganttTasks: GanttTask[];
    hasInteractive: boolean;
  };
}

interface TextFlowData {
  steps: string[];
  connections: Array<{ from: number; to: number; label?: string }>;
}

interface OrgChartData {
  nodes: Array<{ id: string; name: string; title?: string; level: number }>;
  relationships: Array<{ parent: string; child: string }>;
}

/**
 * Diagram Parser Class
 * Extracts and parses various diagram types from document content
 */
export class DiagramParser {
  private mermaidRegex: RegExp;
  private plantumlRegex: RegExp;
  private codeBlockRegex: RegExp;
  // Phase 3: Interactive service
  private interactiveService: InteractiveTimelineService;

  constructor() {
    // Regex patterns for different diagram types
    this.mermaidRegex = /```mermaid\s*\n([\s\S]*?)\n```/gi;
    this.plantumlRegex = /```plantuml\s*\n([\s\S]*?)\n```/gi;
    this.codeBlockRegex = /```(\w+)?\s*\n([\s\S]*?)\n```/gi;
    
    // Phase 3: Initialize interactive service with default config
    this.interactiveService = new InteractiveTimelineService({
      options: {
        clickable: true,
        zoomable: true,
        draggable: true,
        realTimeUpdates: true,
        editMode: false,
      },
      handlers: {
        onTimelineEventClick: (event: TimelineEvent) => {
          console.log("Timeline event clicked:", event);
        },
        onGanttTaskDrag: (task: GanttTask) => {
          console.log("Gantt task dragged:", task);
        },
      },
      theme: {
        primaryColor: "#2E86AB",
        secondaryColor: "#A23B72", 
        accentColor: "#F18F01",
        backgroundColor: "#FFFFFF",
        textColor: "#333333",
      },
    });
  }

  /**
   * Parse all diagrams from document content
   */
  parseDocument(content: string): ParseResult {
    const diagrams: DiagramData[] = [];
    const errors: string[] = [];

    try {
      console.log("🔍 Parsing document for diagrams...");

      // Extract Mermaid diagrams
      const mermaidDiagrams = this.extractMermaidDiagrams(content);
      diagrams.push(...mermaidDiagrams);

      // Extract PlantUML diagrams
      const plantumlDiagrams = this.extractPlantUMLDiagrams(content);
      diagrams.push(...plantumlDiagrams);

      // Extract text-based process flows
      const textFlowDiagrams = this.extractTextDiagrams(content);
      diagrams.push(...textFlowDiagrams);

      // Extract organization charts
      const orgChartDiagrams = this.extractOrgCharts(content);
      diagrams.push(...orgChartDiagrams);

      // Extract timelines
      const timelineDiagrams = this.extractTimelineDiagrams(content);
      diagrams.push(...timelineDiagrams);

      // Extract Gantt charts
      const ganttCharts = this.extractGanttCharts(content);
      diagrams.push(...ganttCharts);

      console.log(`✅ Found ${diagrams.length} diagrams in document`);

      return {
        success: true,
        diagrams,
        errors,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown parsing error";
      console.error("❌ Diagram parsing failed:", errorMessage);
      
      return {
        success: false,
        diagrams,
        errors: [errorMessage],
      };
    }
  }

  /**
   * Extract Mermaid diagrams from content
   */
  extractMermaidDiagrams(content: string): DiagramData[] {
    const diagrams: DiagramData[] = [];
    let match;

    this.mermaidRegex.lastIndex = 0; // Reset regex state
    
    while ((match = this.mermaidRegex.exec(content)) !== null) {
      const diagramContent = match[1].trim();
      const position = match.index;
      
      // Determine Mermaid diagram type
      const mermaidType = this.determineMermaidType(diagramContent);
      
      diagrams.push({
        type: "mermaid",
        content: diagramContent,
        title: this.extractDiagramTitle(diagramContent, "mermaid"),
        position,
        originalText: match[0],
      });

      console.log(`📊 Found Mermaid ${mermaidType} diagram at position ${position}`);
    }

    return diagrams;
  }

  /**
   * Extract PlantUML diagrams from content
   */
  extractPlantUMLDiagrams(content: string): DiagramData[] {
    const diagrams: DiagramData[] = [];
    let match;

    this.plantumlRegex.lastIndex = 0; // Reset regex state
    
    while ((match = this.plantumlRegex.exec(content)) !== null) {
      const diagramContent = match[1].trim();
      const position = match.index;
      
      // Determine PlantUML diagram type
      const plantumlType = this.determinePlantUMLType(diagramContent);
      
      diagrams.push({
        type: "plantuml",
        content: diagramContent,
        title: this.extractDiagramTitle(diagramContent, "plantuml"),
        position,
        originalText: match[0],
      });

      console.log(`📊 Found PlantUML ${plantumlType} diagram at position ${position}`);
    }

    return diagrams;
  }

  /**
   * Extract text-based process flows
   */
  extractTextDiagrams(content: string): DiagramData[] {
    const diagrams: DiagramData[] = [];
    
    // Look for numbered lists that represent process flows
    const processFlowRegex = /(?:##?\s*(?:process|workflow|steps|procedure|method).*?\n)((?:\d+\.\s+.+\n?)+)/gi;
    let match;

    while ((match = processFlowRegex.exec(content)) !== null) {
      const flowContent = match[1].trim();
      const position = match.index;
      
      const processFlow = this.parseTextFlow(flowContent);
      
      if (processFlow.steps.length > 1) {
        diagrams.push({
          type: "text-flow",
          content: JSON.stringify(processFlow),
          title: this.extractSectionTitle(match[0]),
          position,
          originalText: match[0],
        });

        console.log(`📋 Found text-based process flow with ${processFlow.steps.length} steps`);
      }
    }

    return diagrams;
  }

  /**
   * Extract organization charts from content
   */
  extractOrgCharts(content: string): DiagramData[] {
    const diagrams: DiagramData[] = [];
    
    // Look for hierarchical bullet lists that represent org structures
    const orgChartRegex = /(?:##?\s*(?:team|organization|structure|hierarchy).*?\n)((?:^[\s-*+]*\s*.+(?:\n|$))+)/gim;
    let match;

    while ((match = orgChartRegex.exec(content)) !== null) {
      const orgContent = match[1].trim();
      const position = match.index;
      
      const orgChart = this.parseOrgChart(orgContent);
      
      if (orgChart.nodes.length > 1) {
        diagrams.push({
          type: "org-chart",
          content: JSON.stringify(orgChart),
          title: this.extractSectionTitle(match[0]),
          position,
          originalText: match[0],
        });

        console.log(`🏢 Found organization chart with ${orgChart.nodes.length} nodes`);
      }
    }

    return diagrams;
  }    /**
     * Extract timeline diagrams from document content
     */
    private extractTimelineDiagrams(content: string): DiagramData[] {
        const timelineDiagrams: DiagramData[] = [];
        
        // Pattern for timeline markers: dates + events
        const timelinePatterns = [
            /timeline\s*:?\s*([\s\S]+?)(?=\n\s*\n|\n\s*[A-Z]|$)/gi,
            /(\d{4}[-/]\d{1,2}[-/]\d{1,2})\s*[-:]\s*([^\n]+)/gi,
            /(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2}),?\s*(\d{4})\s*[-:]\s*([^\n]+)/gi,
            /milestone\s*:?\s*([^\n]+)/gi,
        ];
        
        for (const pattern of timelinePatterns) {
            let match;
            while ((match = pattern.exec(content)) !== null) {
                const events = TimelineGanttParser.parseTimelineEvents(match[0]);
                if (events.length > 0) {
                    timelineDiagrams.push({
                        type: "timeline",
                        content: match[0],
                        title: this.extractTitle(match[0]) || "Project Timeline",
                        position: match.index,
                        originalText: match[0],
                    });
                }
            }
        }
        
        return timelineDiagrams;
    }

  /**
   * Extract Gantt chart diagrams from document content
   */
  private extractGanttCharts(content: string): DiagramData[] {
    const ganttCharts: DiagramData[] = [];
    
    // Pattern for Gantt chart structures: tasks, dependencies, dates
    const ganttPatterns = [
      /gantt\s*chart?\s*:?\s*([\s\S]+?)(?=\n\s*\n|\n\s*[A-Z]|$)/gi,
      /task\s*:?\s*([^\n]+)\s*(?:start|from)\s*:?\s*([^\n]+)\s*(?:end|to|duration)\s*:?\s*([^\n]+)/gi,
      /(\w+)\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|\s*([^|\n]+)/gi, // Table format
    ];
    
    for (const pattern of ganttPatterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const { tasks, milestones } = TimelineGanttParser.parseGanttTasks(match[0]);
        if (tasks.length > 0) {
          ganttCharts.push({
            type: "gantt-chart",
            content: match[0],
            title: this.extractTitle(match[0]) || "Project Gantt Chart",
            position: match.index,
            originalText: match[0],
          });
        }
      }
    }
    
    return ganttCharts;
  }

  /**
   * Determine Mermaid diagram type
   */
  private determineMermaidType(content: string): string {
    if (content.includes("flowchart") || content.includes("graph")) return "flowchart";
    if (content.includes("sequenceDiagram")) return "sequence";
    if (content.includes("gantt")) return "gantt";
    if (content.includes("pie")) return "pie";
    return "flowchart"; // Default
  }

  /**
   * Determine PlantUML diagram type
   */
  private determinePlantUMLType(content: string): string {
    if (content.includes("@startuml") && content.includes("->")) return "sequence";
    if (content.includes("class ")) return "class";
    if (content.includes("usecase")) return "usecase";
    if (content.includes("activity")) return "activity";
    if (content.includes("component")) return "component";
    return "sequence"; // Default
  }

  /**
   * Extract diagram title from content
   */
  private extractDiagramTitle(content: string, type: string): string {
    // Look for title or first meaningful line
    const lines = content.split("\n").map((line) => line.trim());
    
    for (const line of lines) {
      if (line && !line.startsWith("%") && !line.startsWith("//")) {
        if (type === "mermaid") {
          if (line.includes("title ")) {
            return line.replace("title", "").trim();
          }
          if (!line.includes("flowchart") && !line.includes("graph") && !line.includes("sequenceDiagram")) {
            return line.length > 50 ? line.substring(0, 47) + "..." : line;
          }
        } else if (type === "plantuml") {
          if (line.includes("title ")) {
            return line.replace("title", "").trim();
          }
          if (!line.includes("@start") && !line.includes("@end")) {
            return line.length > 50 ? line.substring(0, 47) + "..." : line;
          }
        }
      }
    }
    
    return `${type.charAt(0).toUpperCase() + type.slice(1)} Diagram`;
  }  /**
   * Extract title from diagram content
   */
  private extractTitle(content: string): string | null {
    const lines = content.split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.match(/^\d|^timeline|^gantt|^mermaid|^plantuml/i)) {
        return trimmed.replace(/[:#-]+\s*/, "").trim();
      }
    }
    return null;
  }

  /**
   * Extract section title from text
   */
  private extractSectionTitle(text: string): string {
    const titleMatch = text.match(/##?\s*(.+)/);
    if (titleMatch) {
      return titleMatch[1].trim();
    }
    return "Process Flow";
  }

  /**
   * Parse text-based process flow
   */
  private parseTextFlow(content: string): TextFlowData {
    const lines = content.split("\n").filter((line) => line.trim());
    const steps: string[] = [];
    const connections: Array<{ from: number; to: number; label?: string }> = [];

    lines.forEach((line, index) => {
      const stepMatch = line.match(/^\d+\.\s*(.+)$/);
      if (stepMatch) {
        steps.push(stepMatch[1].trim());
        
        // Create sequential connections
        if (index > 0) {
          connections.push({
            from: index - 1,
            to: index,
          });
        }
      }
    });

    return { steps, connections };
  }

  /**
   * Parse organization chart from bullet list
   */
  private parseOrgChart(content: string): OrgChartData {
    const lines = content.split("\n").filter((line) => line.trim());
    const nodes: Array<{ id: string; name: string; title?: string; level: number }> = [];
    const relationships: Array<{ parent: string; child: string }> = [];
    
    const parentStack: string[] = [];

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      // Calculate indentation level
      const level = (line.length - trimmed.length) / 2;
      
      // Extract name and title
      const parts = trimmed.replace(/^[-*+]\s*/, "").split(":");
      const name = parts[0].trim();
      const title = parts[1]?.trim();
      
      const nodeId = `node-${index}`;
      
      nodes.push({
        id: nodeId,
        name,
        title,
        level,
      });

      // Manage parent-child relationships
      if (level === 0) {
        parentStack.length = 0;
        parentStack.push(nodeId);
      } else {
        // Adjust parent stack to current level
        parentStack.length = level;
        
        if (parentStack.length > 0) {
          const parentId = parentStack[parentStack.length - 1];
          relationships.push({
            parent: parentId,
            child: nodeId,
          });
        }
        
        parentStack.push(nodeId);
      }
    });

    return { nodes, relationships };
  }

  /**
   * Convert parsed diagram to SVG
   */
  generateSVG(diagram: DiagramData, branding?: { primaryColor: string; secondaryColor: string; accentColor: string }): string {
    const defaultBranding = {
      primaryColor: "#2E86AB",
      secondaryColor: "#A23B72", 
      accentColor: "#F18F01",
    };
    
    const colors = branding || defaultBranding;

    switch (diagram.type) {
      case "mermaid":
        return this.generateMermaidSVG(diagram, colors);
      case "plantuml":
        return this.generatePlantUMLSVG(diagram, colors);
      case "text-flow":
        return this.generateTextFlowSVG(diagram, colors);
      case "org-chart":
        return this.generateOrgChartSVG(diagram, colors);
      case "timeline":
        return this.generateTimelineSVG(diagram, colors);
      case "gantt-chart":
        return this.generateGanttChartSVG(diagram, colors);
      default:
        return this.generateGenericSVG(diagram, colors);
    }
  }

  /**
   * Generate Timeline SVG - Phase 2 Implementation
   */
  private generateTimelineSVG(diagram: DiagramData, colors: any): string {
    const events = TimelineGanttParser.parseTimelineEvents(diagram.content);
    const svgHeight = Math.max(200, events.length * 60 + 100);
    
    let svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="600" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg">
  <style>
    .timeline-line { stroke: ${colors.primaryColor}; stroke-width: 3; }
    .timeline-event { fill: ${colors.secondaryColor}; stroke: ${colors.accentColor}; stroke-width: 2; }
    .timeline-milestone { fill: ${colors.accentColor}; stroke: ${colors.primaryColor}; stroke-width: 2; }
    .timeline-text { font-family: Arial, sans-serif; font-size: 11px; fill: #333; }
    .timeline-date { font-family: Arial, sans-serif; font-size: 9px; fill: #666; }
  </style>
  
  <text x="300" y="20" style="font-family: Arial; font-size: 14px; font-weight: bold; text-anchor: middle;">${diagram.title || "Project Timeline"}</text>
  
  <!-- Timeline line -->
  <line x1="100" y1="50" x2="100" y2="${svgHeight - 30}" class="timeline-line"/>`;

    events.forEach((event, index) => {
      const y = 60 + index * 50;
      const ismilestone = event.milestone;
      const eventClass = ismilestone ? "timeline-milestone" : "timeline-event";
      const shape = ismilestone ? "polygon" : "circle";
      
      if (ismilestone) {
        svgContent += `
  <polygon points="90,${y} 100,${y-10} 110,${y} 100,${y+10}" class="${eventClass}"/>`;
      } else {
        svgContent += `
  <circle cx="100" cy="${y}" r="8" class="${eventClass}"/>`;
      }
      
      svgContent += `
  <text x="120" y="${y+4}" class="timeline-text">${event.title}</text>
  <text x="120" y="${y+16}" class="timeline-date">${event.date}</text>`;
    });

    svgContent += "\n</svg>";
    return svgContent;
  }

  /**
   * Generate Gantt Chart SVG - Phase 2 Implementation
   */
  private generateGanttChartSVG(diagram: DiagramData, colors: any): string {
    const { tasks, milestones } = TimelineGanttParser.parseGanttTasks(diagram.content);
    const svgHeight = Math.max(300, (tasks.length + milestones.length) * 40 + 100);
    const svgWidth = 800;
    
    let svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg">
  <style>
    .gantt-task { fill: ${colors.primaryColor}; stroke: ${colors.secondaryColor}; stroke-width: 1; }
    .gantt-milestone { fill: ${colors.accentColor}; stroke: ${colors.primaryColor}; stroke-width: 2; }
    .gantt-text { font-family: Arial, sans-serif; font-size: 10px; fill: #333; }
    .gantt-header { font-family: Arial, sans-serif; font-size: 11px; font-weight: bold; fill: #333; }
  </style>
  
  <text x="400" y="20" style="font-family: Arial; font-size: 14px; font-weight: bold; text-anchor: middle;">${diagram.title || "Project Gantt Chart"}</text>
  
  <!-- Headers -->
  <text x="20" y="45" class="gantt-header">Task</text>
  <text x="200" y="45" class="gantt-header">Timeline</text>`;

    let currentY = 60;
    
    // Draw tasks
    tasks.forEach((task, index) => {
      const taskWidth = 100; // Simplified fixed width
      const taskHeight = 20;
      
      svgContent += `
  <text x="20" y="${currentY + 15}" class="gantt-text">${task.name}</text>
  <rect x="200" y="${currentY}" width="${taskWidth}" height="${taskHeight}" class="gantt-task" rx="3"/>
  <text x="205" y="${currentY + 15}" class="gantt-text" style="fill: white; font-size: 9px;">${task.start}</text>`;
      
      currentY += 35;
    });
    
    // Draw milestones
    milestones.forEach((milestone, index) => {
      svgContent += `
  <text x="20" y="${currentY + 15}" class="gantt-text">${milestone.name}</text>
  <polygon points="200,${currentY+10} 210,${currentY} 220,${currentY+10} 210,${currentY+20}" class="gantt-milestone"/>`;
      
      currentY += 35;
    });

    svgContent += "\n</svg>";
    return svgContent;
  }

  /**
   * Generate Mermaid SVG
   */
  private generateMermaidSVG(diagram: DiagramData, colors: any): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
  <style>
    .mermaid-node { fill: ${colors.primaryColor}; stroke: ${colors.secondaryColor}; stroke-width: 2; }
    .mermaid-text { font-family: Arial, sans-serif; font-size: 12px; fill: white; text-anchor: middle; }
    .mermaid-edge { stroke: ${colors.accentColor}; stroke-width: 2; marker-end: url(#arrow); }
  </style>
  
  <defs>
    <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
      <path d="M0,0 L0,6 L9,3 z" fill="${colors.accentColor}"/>
    </marker>
  </defs>
  
  <!-- Mermaid Diagram: ${diagram.title || "Flowchart"} -->
  <rect x="50" y="50" width="80" height="40" class="mermaid-node" rx="5"/>
  <text x="90" y="75" class="mermaid-text">Start</text>
  
  <rect x="180" y="50" width="80" height="40" class="mermaid-node" rx="5"/>
  <text x="220" y="75" class="mermaid-text">Process</text>
  
  <rect x="310" y="50" width="80" height="40" class="mermaid-node" rx="5"/>
  <text x="350" y="75" class="mermaid-text">End</text>
  
  <line x1="130" y1="70" x2="180" y2="70" class="mermaid-edge"/>
  <line x1="260" y1="70" x2="310" y2="70" class="mermaid-edge"/>
  
  <text x="200" y="20" style="font-family: Arial; font-size: 14px; font-weight: bold; text-anchor: middle;">${diagram.title || "Mermaid Flowchart"}</text>
</svg>`;
  }

  /**
   * Generate PlantUML SVG
   */
  private generatePlantUMLSVG(diagram: DiagramData, colors: any): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="400" height="250" xmlns="http://www.w3.org/2000/svg">
  <style>
    .plantuml-actor { fill: ${colors.primaryColor}; stroke: ${colors.secondaryColor}; }
    .plantuml-message { stroke: ${colors.accentColor}; stroke-width: 2; marker-end: url(#arrow); }
    .plantuml-text { font-family: Arial, sans-serif; font-size: 11px; fill: #333; }
  </style>
  
  <defs>
    <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
      <path d="M0,0 L0,6 L9,3 z" fill="${colors.accentColor}"/>
    </marker>
  </defs>
  
  <!-- PlantUML Sequence Diagram: ${diagram.title || "Sequence"} -->
  <rect x="50" y="50" width="60" height="80" class="plantuml-actor"/>
  <text x="80" y="95" class="plantuml-text" text-anchor="middle">Actor A</text>
  
  <rect x="280" y="50" width="60" height="80" class="plantuml-actor"/>
  <text x="310" y="95" class="plantuml-text" text-anchor="middle">Actor B</text>
  
  <line x1="110" y1="90" x2="280" y2="90" class="plantuml-message"/>
  <text x="195" y="85" class="plantuml-text" text-anchor="middle">Request</text>
  
  <line x1="280" y1="110" x2="110" y2="110" class="plantuml-message"/>
  <text x="195" y="105" class="plantuml-text" text-anchor="middle">Response</text>
  
  <text x="200" y="20" style="font-family: Arial; font-size: 14px; font-weight: bold; text-anchor: middle;">${diagram.title || "PlantUML Sequence"}</text>
</svg>`;
  }

  /**
   * Generate text flow SVG
   */
  private generateTextFlowSVG(diagram: DiagramData, colors: any): string {
    const flowData: TextFlowData = JSON.parse(diagram.content);
    const stepHeight = 60;
    const stepWidth = 120;
    const svgHeight = Math.max(300, flowData.steps.length * stepHeight + 100);
    
    let svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="400" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg">
  <style>
    .flow-step { fill: ${colors.primaryColor}; stroke: ${colors.secondaryColor}; stroke-width: 2; }
    .flow-text { font-family: Arial, sans-serif; font-size: 10px; fill: white; text-anchor: middle; }
    .flow-arrow { stroke: ${colors.accentColor}; stroke-width: 2; marker-end: url(#arrow); }
  </style>
  
  <defs>
    <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
      <path d="M0,0 L0,6 L9,3 z" fill="${colors.accentColor}"/>
    </marker>
  </defs>
  
  <text x="200" y="20" style="font-family: Arial; font-size: 14px; font-weight: bold; text-anchor: middle;">${diagram.title || "Process Flow"}</text>`;

    // Draw steps
    flowData.steps.forEach((step, index) => {
      const y = 50 + index * stepHeight;
      const shortStep = step.length > 15 ? step.substring(0, 12) + "..." : step;
      
      svgContent += `
  <rect x="140" y="${y}" width="${stepWidth}" height="40" class="flow-step" rx="5"/>
  <text x="200" y="${y + 25}" class="flow-text">${shortStep}</text>`;
      
      // Draw arrow to next step
      if (index < flowData.steps.length - 1) {
        svgContent += `
  <line x1="200" y1="${y + 40}" x2="200" y2="${y + stepHeight}" class="flow-arrow"/>`;
      }
    });

    svgContent += "\n</svg>";
    return svgContent;
  }

  /**
   * Generate organization chart SVG
   */
  private generateOrgChartSVG(diagram: DiagramData, colors: any): string {
    const orgData: OrgChartData = JSON.parse(diagram.content);
    const nodeHeight = 40;
    const nodeWidth = 100;
    const levelHeight = 80;
    const svgHeight = Math.max(300, (Math.max(...orgData.nodes.map((n) => n.level)) + 1) * levelHeight + 100);
    
    let svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="500" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg">
  <style>
    .org-node { fill: ${colors.primaryColor}; stroke: ${colors.secondaryColor}; stroke-width: 2; }
    .org-text { font-family: Arial, sans-serif; font-size: 9px; fill: white; text-anchor: middle; }
    .org-line { stroke: ${colors.accentColor}; stroke-width: 2; }
  </style>
  
  <text x="250" y="20" style="font-family: Arial; font-size: 14px; font-weight: bold; text-anchor: middle;">${diagram.title || "Organization Chart"}</text>`;

    // Draw nodes
    orgData.nodes.forEach((node, index) => {
      const x = 50 + (index % 4) * 110;
      const y = 50 + node.level * levelHeight;
      const shortName = node.name.length > 12 ? node.name.substring(0, 10) + "..." : node.name;
      
      svgContent += `
  <rect x="${x}" y="${y}" width="${nodeWidth}" height="${nodeHeight}" class="org-node" rx="5"/>
  <text x="${x + nodeWidth / 2}" y="${y + 25}" class="org-text">${shortName}</text>`;
    });

    svgContent += "\n</svg>";
    return svgContent;
  }

  /**
   * Generate generic SVG for unknown diagram types
   */
  private generateGenericSVG(diagram: DiagramData, colors: any): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
  <rect x="50" y="50" width="200" height="100" fill="${colors.primaryColor}" stroke="${colors.secondaryColor}" stroke-width="2" rx="10"/>
  <text x="150" y="100" style="font-family: Arial, font-size: 12px; fill: white, text-anchor: middle;">${diagram.title || "Generic Diagram"}</text>
  <text x="150" y="120" style="font-family: Arial, font-size: 10px; fill: white, text-anchor: middle;">Type: ${diagram.type}</text>
</svg>`;
  }

  /**
   * Phase 3: Generate Interactive Timeline SVG
   */
  generateInteractiveTimelineSVG(diagram: DiagramData, events: TimelineEvent[]): string {
    console.log("🎯 Generating interactive timeline SVG...");
    
    return this.interactiveService.generateInteractiveTimeline(events, {
      clickable: true,
      zoomable: true,
      draggable: true,
      realTimeUpdates: true,
      editMode: false,
    });
  }

  /**
   * Phase 3: Generate Interactive Gantt Chart SVG
   */
  generateInteractiveGanttSVG(diagram: DiagramData, tasks: GanttTask[]): string {
    console.log("🎯 Generating interactive Gantt chart SVG...");
    
    return this.interactiveService.generateInteractiveGantt(tasks, {
      clickable: true,
      zoomable: true,
      draggable: true,
      realTimeUpdates: true,
      editMode: false,
    });
  }

  /**
   * Phase 3: Convert timeline to interactive events
   */
  convertTimelineToEvents(timelineDiagram: DiagramData): TimelineEvent[] {
    const events: TimelineEvent[] = [];
    const timelineGanttParser = new TimelineGanttParser();
    
    try {
      const timelineData = timelineGanttParser.parseTimelineData(timelineDiagram.content);
      
      timelineData.events.forEach((event, index) => {
        events.push({
          id: `event-${index}`,
          title: event.title,
          date: event.date,
          type: this.determineEventType(event.title),
          description: event.description,
          category: "timeline",
        });
      });
    } catch (error) {
      console.warn("Failed to convert timeline to events:", error);
    }
    
    return events;
  }

  /**
   * Phase 3: Convert Gantt chart to interactive tasks
   */
  convertGanttToTasks(ganttDiagram: DiagramData): GanttTask[] {
    const tasks: GanttTask[] = [];
    const timelineGanttParser = new TimelineGanttParser();
    
    try {
      const ganttData = timelineGanttParser.parseGanttData(ganttDiagram.content);
      
      ganttData.tasks.forEach((task, index) => {
        tasks.push({
          id: `task-${index}`,
          name: task.name,
          startDate: task.startDate,
          endDate: task.endDate,
          progress: task.progress || 0,
          dependencies: task.dependencies || [],
          assignee: task.assignee,
          priority: this.determinePriority(task.name),
        });
      });
    } catch (error) {
      console.warn("Failed to convert Gantt to tasks:", error);
    }
    
    return tasks;
  }

  /**
   * Phase 3: Determine event type from title
   */
  private determineEventType(title: string): "milestone" | "event" | "deadline" {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes("milestone") || lowerTitle.includes("release") || lowerTitle.includes("launch")) {
      return "milestone";
    }
    if (lowerTitle.includes("deadline") || lowerTitle.includes("due") || lowerTitle.includes("finish")) {
      return "deadline";
    }
    return "event";
  }

  /**
   * Phase 3: Determine task priority from name
   */
  private determinePriority(name: string): "low" | "medium" | "high" | "critical" {
    const lowerName = name.toLowerCase();
    if (lowerName.includes("critical") || lowerName.includes("urgent") || lowerName.includes("high priority")) {
      return "critical";
    }
    if (lowerName.includes("high") || lowerName.includes("important")) {
      return "high";
    }
    if (lowerName.includes("low") || lowerName.includes("minor")) {
      return "low";
    }
    return "medium";
  }

  /**
   * Phase 3: Enable interactive mode for timeline/Gantt diagrams
   */
  enableInteractiveMode(options: InteractiveOptions): void {
    this.interactiveService.updateConfig({
      options,
      handlers: this.interactiveService.getConfig().handlers,
      theme: this.interactiveService.getConfig().theme,
    });
  }

  /**
   * Phase 3: Update interactive theme colors
   */
  updateInteractiveTheme(colors: any): void {
    this.interactiveService.updateConfig({
      options: this.interactiveService.getConfig().options,
      handlers: this.interactiveService.getConfig().handlers,
      theme: {
        primaryColor: colors.primaryColor,
        secondaryColor: colors.secondaryColor,
        accentColor: colors.accentColor,
        backgroundColor: colors.backgroundColor || "#FFFFFF",
        textColor: colors.textColor || "#333333",
      },
    });
  }
}

// Export singleton instance
let diagramParser: DiagramParser | null = null;

export function getDiagramParser(): DiagramParser {
  if (!diagramParser) {
    diagramParser = new DiagramParser();
  }
  return diagramParser;
}
