/*
 * Diagram Parser for Adobe Illustrator Integration
 * Extracts diagram data from markdown content and converts to Illustrator format
 */

import { DiagramData, DiagramNode, DiagramConnection, NodeStyling } from './creative-suite-integration';
import { ADPA_BRAND_GUIDELINES } from '../templates/brand-guidelines';

/**
 * Diagram Parser Service
 */
export class DiagramParser {
  private brandColors = ADPA_BRAND_GUIDELINES.colors;

  /**
   * Parse diagrams from markdown content
   */
  parseDiagramsFromMarkdown(markdownContent: string): DiagramData[] {
    const diagrams: DiagramData[] = [];
    
    // Extract mermaid diagrams
    const mermaidDiagrams = this.extractMermaidDiagrams(markdownContent);
    diagrams.push(...mermaidDiagrams);
    
    // Extract PlantUML diagrams
    const plantumlDiagrams = this.extractPlantUMLDiagrams(markdownContent);
    diagrams.push(...plantumlDiagrams);
    
    // Extract simple text-based diagrams
    const textDiagrams = this.extractTextDiagrams(markdownContent);
    diagrams.push(...textDiagrams);
    
    return diagrams;
  }

  /**
   * Extract Mermaid diagrams from markdown
   */
  private extractMermaidDiagrams(content: string): DiagramData[] {
    const diagrams: DiagramData[] = [];
    const mermaidRegex = /```mermaid\n([\s\S]*?)\n```/g;
    let match;

    while ((match = mermaidRegex.exec(content)) !== null) {
      const mermaidCode = match[1];
      const diagram = this.parseMermaidCode(mermaidCode);
      if (diagram) {
        diagrams.push(diagram);
      }
    }

    return diagrams;
  }

  /**
   * Parse Mermaid code to DiagramData
   */
  private parseMermaidCode(mermaidCode: string): DiagramData | null {
    const lines = mermaidCode.trim().split('\n');
    const firstLine = lines[0].trim();

    // Detect diagram type
    if (firstLine.startsWith('flowchart') || firstLine.startsWith('graph')) {
      return this.parseMermaidFlowchart(lines);
    } else if (firstLine.startsWith('sequenceDiagram')) {
      return this.parseMermaidSequence(lines);
    } else if (firstLine.startsWith('gantt')) {
      return this.parseMermaidGantt(lines);
    }

    return null;
  }

  /**
   * Parse Mermaid flowchart
   */
  private parseMermaidFlowchart(lines: string[]): DiagramData {
    const nodes: DiagramNode[] = [];
    const connections: DiagramConnection[] = [];
    const nodeMap = new Map<string, DiagramNode>();

    // Skip first line (flowchart declaration)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Parse node definitions and connections
      if (line.includes('-->') || line.includes('---')) {
        const connection = this.parseFlowchartConnection(line);
        if (connection) {
          connections.push(connection);
          
          // Create nodes if they don't exist
          this.ensureNodeExists(connection.from, nodeMap, nodes);
          this.ensureNodeExists(connection.to, nodeMap, nodes);
        }
      } else if (line.includes('[') || line.includes('(') || line.includes('{')) {
        const node = this.parseFlowchartNode(line);
        if (node) {
          nodes.push(node);
          nodeMap.set(node.id, node);
        }
      }
    }

    // Auto-layout nodes
    this.autoLayoutNodes(nodes);

    return {
      type: 'flowchart',
      title: 'Process Flow',
      nodes,
      connections,
      layout: {
        direction: 'horizontal',
        spacing: { x: 150, y: 100 },
        alignment: 'center'
      }
    };
  }

  /**
   * Parse flowchart connection
   */
  private parseFlowchartConnection(line: string): DiagramConnection | null {
    // Handle different arrow types
    const arrowPatterns = [
      /(\w+)\s*-->\s*(\w+)/,
      /(\w+)\s*---\s*(\w+)/,
      /(\w+)\s*-\.\s*(\w+)/
    ];

    for (const pattern of arrowPatterns) {
      const match = line.match(pattern);
      if (match) {
        return {
          from: match[1],
          to: match[2],
          type: line.includes('-.') ? 'dotted' : 'solid',
          color: this.brandColors.primary
        };
      }
    }

    return null;
  }

  /**
   * Parse flowchart node
   */
  private parseFlowchartNode(line: string): DiagramNode | null {
    // Parse different node shapes
    const nodePatterns = [
      /(\w+)\[([^\]]+)\]/, // Rectangle
      /(\w+)\(([^)]+)\)/, // Rounded rectangle
      /(\w+)\{([^}]+)\}/, // Diamond
      /(\w+)\(\(([^)]+)\)\)/ // Circle
    ];

    for (const pattern of nodePatterns) {
      const match = line.match(pattern);
      if (match) {
        const nodeType = this.determineNodeType(line);
        return {
          id: match[1],
          label: match[2] || match[1],
          type: nodeType,
          position: { x: 0, y: 0 }, // Will be set by auto-layout
          size: { width: 120, height: 60 },
          styling: this.getNodeStyling(nodeType)
        };
      }
    }

    return null;
  }

  /**
   * Determine node type from shape
   */
  private determineNodeType(line: string): DiagramNode['type'] {
    if (line.includes('((') && line.includes('))')) return 'start';
    if (line.includes('{') && line.includes('}')) return 'decision';
    if (line.includes('[') && line.includes(']')) return 'process';
    if (line.includes('(') && line.includes(')')) return 'data';
    return 'process';
  }

  /**
   * Get node styling based on type
   */
  private getNodeStyling(nodeType: DiagramNode['type']): NodeStyling {
    const baseStyle = {
      fontSize: '12px',
      fontWeight: '500',
      textColor: '#FFFFFF'
    };

    switch (nodeType) {
      case 'start':
      case 'end':
        return {
          ...baseStyle,
          backgroundColor: this.brandColors.success,
          borderColor: this.brandColors.success
        };
      case 'decision':
        return {
          ...baseStyle,
          backgroundColor: this.brandColors.warning,
          borderColor: this.brandColors.warning,
          textColor: '#000000'
        };
      case 'process':
        return {
          ...baseStyle,
          backgroundColor: this.brandColors.primary,
          borderColor: this.brandColors.primary
        };
      case 'data':
        return {
          ...baseStyle,
          backgroundColor: this.brandColors.secondary,
          borderColor: this.brandColors.secondary
        };
      default:
        return {
          ...baseStyle,
          backgroundColor: this.brandColors.neutral.medium,
          borderColor: this.brandColors.neutral.dark
        };
    }
  }

  /**
   * Ensure node exists in the collection
   */
  private ensureNodeExists(nodeId: string, nodeMap: Map<string, DiagramNode>, nodes: DiagramNode[]): void {
    if (!nodeMap.has(nodeId)) {
      const node: DiagramNode = {
        id: nodeId,
        label: nodeId,
        type: 'process',
        position: { x: 0, y: 0 },
        size: { width: 120, height: 60 },
        styling: this.getNodeStyling('process')
      };
      nodes.push(node);
      nodeMap.set(nodeId, node);
    }
  }

  /**
   * Auto-layout nodes in a flowchart
   */
  private autoLayoutNodes(nodes: DiagramNode[]): void {
    const spacing = { x: 150, y: 100 };
    const startX = 50;
    const startY = 50;

    // Simple horizontal layout
    nodes.forEach((node, index) => {
      node.position.x = startX + (index * spacing.x);
      node.position.y = startY;
    });
  }

  /**
   * Extract PlantUML diagrams
   */
  private extractPlantUMLDiagrams(content: string): DiagramData[] {
    const diagrams: DiagramData[] = [];
    const plantumlRegex = /```plantuml\n([\s\S]*?)\n```/g;
    let match;

    while ((match = plantumlRegex.exec(content)) !== null) {
      const plantumlCode = match[1];
      const diagram = this.parsePlantUMLCode(plantumlCode);
      if (diagram) {
        diagrams.push(diagram);
      }
    }

    return diagrams;
  }

  /**
   * Parse PlantUML code (simplified)
   */
  private parsePlantUMLCode(plantumlCode: string): DiagramData | null {
    // Simplified PlantUML parsing
    const lines = plantumlCode.trim().split('\n');
    
    if (lines.some(line => line.includes('@startuml'))) {
      return {
        type: 'architecture',
        title: 'System Architecture',
        nodes: [],
        connections: [],
        layout: {
          direction: 'vertical',
          spacing: { x: 120, y: 80 },
          alignment: 'center'
        }
      };
    }

    return null;
  }

  /**
   * Extract simple text-based diagrams
   */
  private extractTextDiagrams(content: string): DiagramData[] {
    const diagrams: DiagramData[] = [];
    
    // Look for sections that might contain diagram descriptions
    const diagramSections = this.findDiagramSections(content);
    
    for (const section of diagramSections) {
      const diagram = this.parseTextDiagram(section);
      if (diagram) {
        diagrams.push(diagram);
      }
    }

    return diagrams;
  }

  /**
   * Find sections that might contain diagrams
   */
  private findDiagramSections(content: string): string[] {
    const sections: string[] = [];
    const diagramKeywords = [
      'workflow', 'process flow', 'architecture', 'diagram',
      'flowchart', 'organization chart', 'timeline', 'steps'
    ];

    const lines = content.split('\n');
    let currentSection = '';
    let inDiagramSection = false;

    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      
      // Check if this line indicates a diagram section
      if (diagramKeywords.some(keyword => lowerLine.includes(keyword))) {
        if (currentSection) {
          sections.push(currentSection);
        }
        currentSection = line + '\n';
        inDiagramSection = true;
      } else if (inDiagramSection) {
        currentSection += line + '\n';
        
        // End section on next header or empty lines
        if (line.startsWith('#') && currentSection.length > line.length + 1) {
          sections.push(currentSection);
          currentSection = '';
          inDiagramSection = false;
        }
      }
    }

    if (currentSection) {
      sections.push(currentSection);
    }

    return sections;
  }

  /**
   * Parse text-based diagram description
   */
  private parseTextDiagram(sectionText: string): DiagramData | null {
    const lines = sectionText.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) return null;

    const title = lines[0].replace(/^#+\s*/, '');
    const nodes: DiagramNode[] = [];
    const connections: DiagramConnection[] = [];

    // Simple parsing for numbered steps or bullet points
    const stepPattern = /^\d+\.\s*(.+)$/;
    const bulletPattern = /^[-*]\s*(.+)$/;

    let nodeIndex = 0;
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      const stepMatch = line.match(stepPattern);
      const bulletMatch = line.match(bulletPattern);

      if (stepMatch || bulletMatch) {
        const label = (stepMatch || bulletMatch)[1];
        const nodeId = `step${nodeIndex + 1}`;
        
        nodes.push({
          id: nodeId,
          label,
          type: nodeIndex === 0 ? 'start' : nodeIndex === lines.length - 2 ? 'end' : 'process',
          position: { x: 50 + (nodeIndex * 150), y: 50 },
          size: { width: 140, height: 60 },
          styling: this.getNodeStyling('process')
        });

        // Connect to previous node
        if (nodeIndex > 0) {
          connections.push({
            from: `step${nodeIndex}`,
            to: nodeId,
            type: 'solid',
            color: this.brandColors.primary
          });
        }

        nodeIndex++;
      }
    }

    if (nodes.length === 0) return null;

    return {
      type: 'process',
      title,
      nodes,
      connections,
      layout: {
        direction: 'horizontal',
        spacing: { x: 150, y: 100 },
        alignment: 'center'
      }
    };
  }

  /**
   * Parse Mermaid sequence diagram
   */
  private parseMermaidSequence(lines: string[]): DiagramData {
    const nodes: DiagramNode[] = [];
    const connections: DiagramConnection[] = [];
    const participants = new Set<string>();

    // Extract participants and interactions
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Parse participant declarations
      const participantMatch = line.match(/participant\s+(\w+)(?:\s+as\s+(.+))?/);
      if (participantMatch) {
        participants.add(participantMatch[1]);
        continue;
      }

      // Parse interactions
      const interactionMatch = line.match(/(\w+)\s*->>?\s*(\w+)\s*:\s*(.+)/);
      if (interactionMatch) {
        const [, from, to, message] = interactionMatch;
        participants.add(from);
        participants.add(to);
        
        connections.push({
          from,
          to,
          label: message,
          type: 'solid',
          color: this.brandColors.primary
        });
      }
    }

    // Create nodes for participants
    let index = 0;
    for (const participant of participants) {
      nodes.push({
        id: participant,
        label: participant,
        type: 'system',
        position: { x: 50 + (index * 200), y: 50 },
        size: { width: 100, height: 50 },
        styling: this.getNodeStyling('system')
      });
      index++;
    }

    return {
      type: 'architecture',
      title: 'Sequence Diagram',
      nodes,
      connections,
      layout: {
        direction: 'horizontal',
        spacing: { x: 200, y: 150 },
        alignment: 'center'
      }
    };
  }

  /**
   * Parse Mermaid Gantt chart
   */
  private parseMermaidGantt(lines: string[]): DiagramData {
    const nodes: DiagramNode[] = [];
    const connections: DiagramConnection[] = [];

    // Parse Gantt chart tasks
    let taskIndex = 0;
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Parse task definitions
      const taskMatch = line.match(/(.+?)\s*:\s*(.+)/);
      if (taskMatch && !line.includes('title') && !line.includes('dateFormat')) {
        const [, taskName] = taskMatch;
        
        nodes.push({
          id: `task${taskIndex + 1}`,
          label: taskName.trim(),
          type: 'process',
          position: { x: 50, y: 50 + (taskIndex * 80) },
          size: { width: 200, height: 60 },
          styling: this.getNodeStyling('process')
        });

        // Connect tasks sequentially
        if (taskIndex > 0) {
          connections.push({
            from: `task${taskIndex}`,
            to: `task${taskIndex + 1}`,
            type: 'solid',
            color: this.brandColors.secondary
          });
        }

        taskIndex++;
      }
    }

    return {
      type: 'timeline',
      title: 'Project Timeline',
      nodes,
      connections,
      layout: {
        direction: 'vertical',
        spacing: { x: 250, y: 80 },
        alignment: 'left'
      }
    };
  }
}

/**
 * Create diagram parser instance
 */
export function createDiagramParser(): DiagramParser {
  return new DiagramParser();
}
