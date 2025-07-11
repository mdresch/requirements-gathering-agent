/*
 * AI-Powered Smart Diagram Generator
 * Generates professional diagrams from natural language descriptions
 */

import { DiagramData, DiagramNode, DiagramConnection } from '../adobe/creative-suite-integration';
import { ADPA_BRAND_GUIDELINES } from '../templates/brand-guidelines';

/**
 * Natural Language Diagram Request
 */
export interface DiagramRequest {
  description: string;
  type?: 'flowchart' | 'orgchart' | 'timeline' | 'process' | 'architecture' | 'network';
  style?: 'corporate' | 'technical' | 'modern' | 'minimal';
  entities?: string[];
  relationships?: string[];
  context?: string;
}

/**
 * AI Diagram Generation Result
 */
export interface DiagramGenerationResult {
  diagram: DiagramData;
  confidence: number;
  reasoning: string;
  suggestions: string[];
  alternatives: DiagramData[];
}

/**
 * Entity Recognition Result
 */
interface EntityRecognition {
  entities: RecognizedEntity[];
  relationships: RecognizedRelationship[];
  flow: FlowStep[];
}

interface RecognizedEntity {
  name: string;
  type: 'person' | 'system' | 'process' | 'data' | 'decision' | 'start' | 'end';
  confidence: number;
  context: string;
}

interface RecognizedRelationship {
  from: string;
  to: string;
  type: 'flows_to' | 'reports_to' | 'depends_on' | 'communicates_with' | 'contains';
  label?: string;
  confidence: number;
}

interface FlowStep {
  order: number;
  description: string;
  type: 'start' | 'process' | 'decision' | 'end';
}

/**
 * Smart Diagram Generator using AI techniques
 */
export class SmartDiagramGenerator {
  private entityPatterns: Map<string, RegExp[]>;
  private relationshipPatterns: Map<string, RegExp[]>;
  private brandColors = ADPA_BRAND_GUIDELINES.colors;

  constructor() {
    this.initializePatterns();
  }

  /**
   * Generate diagram from natural language description
   */
  async generateDiagramFromDescription(request: DiagramRequest): Promise<DiagramGenerationResult> {
    // Step 1: Analyze the description
    const analysis = this.analyzeDescription(request.description);
    
    // Step 2: Extract entities and relationships
    const recognition = this.recognizeEntitiesAndRelationships(request.description);
    
    // Step 3: Determine optimal diagram type
    const diagramType = request.type || this.determineDiagramType(recognition, analysis);
    
    // Step 4: Generate diagram structure
    const diagram = this.generateDiagramStructure(recognition, diagramType, request.style || 'corporate');
    
    // Step 5: Calculate confidence and provide reasoning
    const confidence = this.calculateConfidence(recognition, diagram);
    const reasoning = this.generateReasoning(recognition, diagramType, confidence);
    
    // Step 6: Generate suggestions and alternatives
    const suggestions = this.generateSuggestions(recognition, diagram);
    const alternatives = this.generateAlternatives(recognition, diagramType);

    return {
      diagram,
      confidence,
      reasoning,
      suggestions,
      alternatives
    };
  }

  /**
   * Generate process flow from step-by-step description
   */
  generateProcessFlow(description: string): DiagramData {
    const steps = this.extractProcessSteps(description);
    const nodes: DiagramNode[] = [];
    const connections: DiagramConnection[] = [];

    steps.forEach((step, index) => {
      const nodeId = `step${index + 1}`;
      const nodeType = this.determineStepType(step, index, steps.length);
      
      nodes.push({
        id: nodeId,
        label: step.description,
        type: nodeType,
        position: { x: 50 + (index * 200), y: 100 },
        size: { width: 180, height: 80 },
        styling: this.getNodeStyling(nodeType)
      });

      // Connect to previous step
      if (index > 0) {
        connections.push({
          from: `step${index}`,
          to: nodeId,
          type: 'solid',
          color: this.brandColors.primary
        });
      }
    });

    return {
      type: 'process',
      title: 'Process Flow',
      nodes,
      connections,
      layout: {
        direction: 'horizontal',
        spacing: { x: 200, y: 120 },
        alignment: 'center'
      }
    };
  }

  /**
   * Generate organization chart from team description
   */
  generateOrganizationChart(description: string): DiagramData {
    const hierarchy = this.extractHierarchy(description);
    const nodes: DiagramNode[] = [];
    const connections: DiagramConnection[] = [];

    this.buildHierarchyNodes(hierarchy, nodes, connections, 0, 0);

    return {
      type: 'orgchart',
      title: 'Organization Chart',
      nodes,
      connections,
      layout: {
        direction: 'vertical',
        spacing: { x: 200, y: 120 },
        alignment: 'center'
      }
    };
  }

  /**
   * Generate system architecture from technical description
   */
  generateSystemArchitecture(description: string): DiagramData {
    const components = this.extractSystemComponents(description);
    const nodes: DiagramNode[] = [];
    const connections: DiagramConnection[] = [];

    components.forEach((component, index) => {
      const nodeId = `component${index + 1}`;
      
      nodes.push({
        id: nodeId,
        label: component.name,
        type: 'system',
        position: this.calculateArchitecturePosition(index, components.length),
        size: { width: 150, height: 100 },
        styling: this.getSystemStyling(component.type)
      });
    });

    // Generate connections based on component relationships
    this.generateSystemConnections(components, connections);

    return {
      type: 'architecture',
      title: 'System Architecture',
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
   * Generate timeline from temporal description
   */
  generateTimeline(description: string): DiagramData {
    const events = this.extractTimelineEvents(description);
    const nodes: DiagramNode[] = [];
    const connections: DiagramConnection[] = [];

    events.forEach((event, index) => {
      const nodeId = `event${index + 1}`;
      
      nodes.push({
        id: nodeId,
        label: `${event.date}\n${event.description}`,
        type: 'process',
        position: { x: 50, y: 50 + (index * 120) },
        size: { width: 250, height: 80 },
        styling: this.getTimelineStyling(event.type)
      });

      // Connect to previous event
      if (index > 0) {
        connections.push({
          from: `event${index}`,
          to: nodeId,
          type: 'solid',
          color: this.brandColors.secondary
        });
      }
    });

    return {
      type: 'timeline',
      title: 'Timeline',
      nodes,
      connections,
      layout: {
        direction: 'vertical',
        spacing: { x: 300, y: 120 },
        alignment: 'left'
      }
    };
  }

  // Private helper methods

  private initializePatterns(): void {
    this.entityPatterns = new Map([
      ['person', [/\b(manager|director|lead|developer|analyst|user|customer)\b/gi]],
      ['system', [/\b(system|application|service|api|database|server)\b/gi]],
      ['process', [/\b(process|workflow|procedure|step|task|activity)\b/gi]],
      ['decision', [/\b(if|whether|decide|choose|determine|check)\b/gi]]
    ]);

    this.relationshipPatterns = new Map([
      ['flows_to', [/\b(then|next|after|flows to|goes to|leads to)\b/gi]],
      ['reports_to', [/\b(reports to|managed by|under|supervised by)\b/gi]],
      ['depends_on', [/\b(depends on|requires|needs|uses)\b/gi]],
      ['communicates_with', [/\b(communicates with|talks to|interfaces with)\b/gi]]
    ]);
  }

  private analyzeDescription(description: string): any {
    return {
      length: description.length,
      complexity: description.split(' ').length > 50 ? 'high' : 'medium',
      hasSequence: /\b(first|second|then|next|finally)\b/i.test(description),
      hasHierarchy: /\b(manager|lead|director|reports to)\b/i.test(description),
      hasSystems: /\b(system|api|database|service)\b/i.test(description)
    };
  }

  private recognizeEntitiesAndRelationships(description: string): EntityRecognition {
    const entities: RecognizedEntity[] = [];
    const relationships: RecognizedRelationship[] = [];
    const flow: FlowStep[] = [];

    // Extract entities
    for (const [type, patterns] of this.entityPatterns) {
      for (const pattern of patterns) {
        const matches = description.match(pattern);
        if (matches) {
          matches.forEach(match => {
            entities.push({
              name: match,
              type: type as any,
              confidence: 0.8,
              context: description.substring(description.indexOf(match) - 20, description.indexOf(match) + 20)
            });
          });
        }
      }
    }

    // Extract relationships
    for (const [type, patterns] of this.relationshipPatterns) {
      for (const pattern of patterns) {
        const matches = description.match(pattern);
        if (matches) {
          // Simplified relationship extraction
          relationships.push({
            from: 'entity1',
            to: 'entity2',
            type: type as any,
            confidence: 0.7
          });
        }
      }
    }

    // Extract flow steps
    const stepPattern = /\b(\d+\.|first|second|third|then|next|finally)\s+([^.!?]+)/gi;
    let match;
    let order = 1;
    while ((match = stepPattern.exec(description)) !== null) {
      flow.push({
        order: order++,
        description: match[2].trim(),
        type: order === 1 ? 'start' : 'process'
      });
    }

    return { entities, relationships, flow };
  }

  private determineDiagramType(recognition: EntityRecognition, analysis: any): DiagramData['type'] {
    if (analysis.hasSequence && recognition.flow.length > 0) return 'process';
    if (analysis.hasHierarchy) return 'orgchart';
    if (analysis.hasSystems) return 'architecture';
    if (recognition.entities.some(e => e.type === 'decision')) return 'flowchart';
    return 'flowchart'; // Default
  }

  private generateDiagramStructure(
    recognition: EntityRecognition, 
    type: DiagramData['type'], 
    style: string
  ): DiagramData {
    switch (type) {
      case 'process':
        return this.buildProcessDiagram(recognition, style);
      case 'orgchart':
        return this.buildOrgChart(recognition, style);
      case 'architecture':
        return this.buildArchitectureDiagram(recognition, style);
      case 'flowchart':
      default:
        return this.buildFlowchart(recognition, style);
    }
  }

  private buildProcessDiagram(recognition: EntityRecognition, style: string): DiagramData {
    const nodes: DiagramNode[] = [];
    const connections: DiagramConnection[] = [];

    recognition.flow.forEach((step, index) => {
      const nodeId = `step${index + 1}`;
      nodes.push({
        id: nodeId,
        label: step.description,
        type: step.type,
        position: { x: 50 + (index * 200), y: 100 },
        size: { width: 180, height: 80 },
        styling: this.getNodeStyling(step.type)
      });

      if (index > 0) {
        connections.push({
          from: `step${index}`,
          to: nodeId,
          type: 'solid',
          color: this.brandColors.primary
        });
      }
    });

    return {
      type: 'process',
      title: 'Process Flow',
      nodes,
      connections,
      layout: {
        direction: 'horizontal',
        spacing: { x: 200, y: 120 },
        alignment: 'center'
      }
    };
  }

  private buildOrgChart(recognition: EntityRecognition, style: string): DiagramData {
    const nodes: DiagramNode[] = [];
    const connections: DiagramConnection[] = [];

    // Simplified org chart generation
    const people = recognition.entities.filter(e => e.type === 'person');
    people.forEach((person, index) => {
      const nodeId = `person${index + 1}`;
      nodes.push({
        id: nodeId,
        label: person.name,
        type: 'person',
        position: { x: 50 + (index * 200), y: 50 + (Math.floor(index / 3) * 120) },
        size: { width: 150, height: 80 },
        styling: this.getNodeStyling('person')
      });
    });

    return {
      type: 'orgchart',
      title: 'Organization Chart',
      nodes,
      connections,
      layout: {
        direction: 'vertical',
        spacing: { x: 200, y: 120 },
        alignment: 'center'
      }
    };
  }

  private buildArchitectureDiagram(recognition: EntityRecognition, style: string): DiagramData {
    const nodes: DiagramNode[] = [];
    const connections: DiagramConnection[] = [];

    const systems = recognition.entities.filter(e => e.type === 'system');
    systems.forEach((system, index) => {
      const nodeId = `system${index + 1}`;
      nodes.push({
        id: nodeId,
        label: system.name,
        type: 'system',
        position: { x: 50 + (index * 200), y: 100 },
        size: { width: 150, height: 100 },
        styling: this.getNodeStyling('system')
      });
    });

    return {
      type: 'architecture',
      title: 'System Architecture',
      nodes,
      connections,
      layout: {
        direction: 'horizontal',
        spacing: { x: 200, y: 150 },
        alignment: 'center'
      }
    };
  }

  private buildFlowchart(recognition: EntityRecognition, style: string): DiagramData {
    const nodes: DiagramNode[] = [];
    const connections: DiagramConnection[] = [];

    // Create a simple flowchart from entities
    recognition.entities.forEach((entity, index) => {
      const nodeId = `node${index + 1}`;
      nodes.push({
        id: nodeId,
        label: entity.name,
        type: entity.type as any,
        position: { x: 50 + (index * 200), y: 100 },
        size: { width: 150, height: 80 },
        styling: this.getNodeStyling(entity.type as any)
      });
    });

    return {
      type: 'flowchart',
      title: 'Flowchart',
      nodes,
      connections,
      layout: {
        direction: 'horizontal',
        spacing: { x: 200, y: 120 },
        alignment: 'center'
      }
    };
  }

  private getNodeStyling(nodeType: string): any {
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
      case 'person':
        return {
          ...baseStyle,
          backgroundColor: this.brandColors.secondary,
          borderColor: this.brandColors.secondary
        };
      case 'system':
        return {
          ...baseStyle,
          backgroundColor: this.brandColors.accent,
          borderColor: this.brandColors.accent,
          textColor: '#000000'
        };
      default:
        return {
          ...baseStyle,
          backgroundColor: this.brandColors.neutral.medium,
          borderColor: this.brandColors.neutral.dark
        };
    }
  }

  private calculateConfidence(recognition: EntityRecognition, diagram: DiagramData): number {
    let confidence = 0.5; // Base confidence

    if (recognition.entities.length > 0) confidence += 0.2;
    if (recognition.relationships.length > 0) confidence += 0.2;
    if (diagram.nodes.length > 1) confidence += 0.1;

    return Math.min(confidence, 0.95);
  }

  private generateReasoning(recognition: EntityRecognition, type: DiagramData['type'], confidence: number): string {
    return `Generated ${type} diagram with ${confidence * 100}% confidence based on ${recognition.entities.length} entities and ${recognition.relationships.length} relationships detected.`;
  }

  private generateSuggestions(recognition: EntityRecognition, diagram: DiagramData): string[] {
    const suggestions: string[] = [];

    if (diagram.nodes.length < 3) {
      suggestions.push('Consider adding more detail to create a more comprehensive diagram');
    }

    if (recognition.relationships.length === 0) {
      suggestions.push('Add relationship descriptions to improve diagram connections');
    }

    suggestions.push('Review and adjust node positions for optimal layout');

    return suggestions;
  }

  private generateAlternatives(recognition: EntityRecognition, primaryType: DiagramData['type']): DiagramData[] {
    const alternatives: DiagramData[] = [];

    // Generate alternative diagram types
    if (primaryType !== 'flowchart') {
      alternatives.push(this.buildFlowchart(recognition, 'corporate'));
    }

    if (primaryType !== 'process' && recognition.flow.length > 0) {
      alternatives.push(this.buildProcessDiagram(recognition, 'corporate'));
    }

    return alternatives;
  }

  // Additional helper methods for specific diagram types
  private extractProcessSteps(description: string): FlowStep[] {
    const steps: FlowStep[] = [];
    const stepPattern = /\b(\d+\.|step \d+|first|second|third|then|next|finally)\s*:?\s*([^.!?\n]+)/gi;
    let match;
    let order = 1;

    while ((match = stepPattern.exec(description)) !== null) {
      steps.push({
        order: order++,
        description: match[2].trim(),
        type: order === 1 ? 'start' : order === steps.length + 1 ? 'end' : 'process'
      });
    }

    return steps;
  }

  private extractHierarchy(description: string): any {
    // Simplified hierarchy extraction
    return { levels: [] };
  }

  private extractSystemComponents(description: string): any[] {
    const components = [];
    const systemPattern = /\b(system|service|api|database|server|application)\b/gi;
    const matches = description.match(systemPattern);
    
    if (matches) {
      matches.forEach((match, index) => {
        components.push({
          name: match,
          type: 'system',
          index
        });
      });
    }

    return components;
  }

  private extractTimelineEvents(description: string): any[] {
    const events = [];
    const datePattern = /\b(\d{4}|\w+ \d{4}|\w+ \d{1,2})\b/g;
    const matches = description.match(datePattern);
    
    if (matches) {
      matches.forEach((match, index) => {
        events.push({
          date: match,
          description: `Event ${index + 1}`,
          type: 'milestone'
        });
      });
    }

    return events;
  }

  private determineStepType(step: FlowStep, index: number, totalSteps: number): DiagramNode['type'] {
    if (index === 0) return 'start';
    if (index === totalSteps - 1) return 'end';
    if (step.description.toLowerCase().includes('decide') || step.description.toLowerCase().includes('if')) return 'decision';
    return 'process';
  }

  private buildHierarchyNodes(hierarchy: any, nodes: DiagramNode[], connections: DiagramConnection[], level: number, parentId: string): void {
    // Simplified hierarchy building
  }

  private calculateArchitecturePosition(index: number, total: number): { x: number; y: number } {
    const cols = Math.ceil(Math.sqrt(total));
    const row = Math.floor(index / cols);
    const col = index % cols;
    
    return {
      x: 50 + (col * 200),
      y: 50 + (row * 150)
    };
  }

  private getSystemStyling(type: string): any {
    return this.getNodeStyling('system');
  }

  private generateSystemConnections(components: any[], connections: DiagramConnection[]): void {
    // Simplified connection generation
    for (let i = 0; i < components.length - 1; i++) {
      connections.push({
        from: `component${i + 1}`,
        to: `component${i + 2}`,
        type: 'solid',
        color: this.brandColors.primary
      });
    }
  }

  private getTimelineStyling(type: string): any {
    return this.getNodeStyling('process');
  }
}

/**
 * Create smart diagram generator instance
 */
export function createSmartDiagramGenerator(): SmartDiagramGenerator {
  return new SmartDiagramGenerator();
}
