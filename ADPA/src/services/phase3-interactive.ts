/**
 * Phase 3: Interactive Features Service
 * Provides interactive functionality for timeline and Gantt chart diagrams
 * Built on Phase 1/2 foundation with SVG manipulation and event handling
 */

export interface InteractiveOptions {
  clickable: boolean;
  zoomable: boolean;
  draggable: boolean;
  realTimeUpdates: boolean;
  editMode: boolean;
}

export interface TimelineEvent {
  id: string;
  title: string;
  date: Date;
  type: "milestone" | "event" | "deadline";
  description?: string;
  category?: string;
}

export interface GanttTask {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  progress: number; // 0-100
  dependencies: string[];
  assignee?: string;
  priority: "low" | "medium" | "high" | "critical";
}

export interface DateRange {
  start: Date;
  end: Date;
}

export interface ZoomLevel {
  scale: number;
  unit: "day" | "week" | "month" | "quarter";
  label: string;
}

export interface EventHandlers {
  onTimelineEventClick?: (event: TimelineEvent) => void;
  onTimelineEventEdit?: (event: TimelineEvent, updates: Partial<TimelineEvent>) => void;
  onGanttTaskDrag?: (task: GanttTask, newDates: DateRange) => void;
  onGanttTaskEdit?: (task: GanttTask, updates: Partial<GanttTask>) => void;
  onZoomChange?: (zoomLevel: ZoomLevel) => void;
  onDateRangeChange?: (range: DateRange) => void;
}

export interface InteractiveConfig {
  options: InteractiveOptions;
  handlers: EventHandlers;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    backgroundColor: string;
    textColor: string;
  };
}

export class InteractiveTimelineService {
  private events: TimelineEvent[] = [];
  private config: InteractiveConfig;
  private currentZoom: ZoomLevel;
  private selectedDateRange: DateRange;

  constructor(config: InteractiveConfig) {
    this.config = config;
    this.currentZoom = {
      scale: 1,
      unit: "month",
      label: "Monthly View",
    };
    
    // Default to current year range
    const now = new Date();
    this.selectedDateRange = {
      start: new Date(now.getFullYear(), 0, 1),
      end: new Date(now.getFullYear(), 11, 31),
    };
  }

  /**
   * Generate interactive SVG timeline with event handlers
   */
  generateInteractiveTimeline(events: TimelineEvent[], options: InteractiveOptions): string {
    this.events = events;
    
    const svgWidth = 900;
    const svgHeight = 400;
    const margin = { top: 50, right: 50, bottom: 80, left: 50 };
    
    // Calculate timeline dimensions
    const timelineWidth = svgWidth - margin.left - margin.right;
    const timelineHeight = svgHeight - margin.top - margin.bottom;
    
    // Generate interactive SVG
    return `
      <svg width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg" 
           class="adpa-interactive-timeline" id="timeline-${Date.now()}">
        <defs>
          ${this.generateTimelineDefinitions()}
        </defs>
        
        <!-- Background -->
        <rect width="100%" height="100%" fill="${this.config.theme.backgroundColor}"/>
        
        <!-- Title -->
        <text x="${svgWidth / 2}" y="30" text-anchor="middle" 
              font-family="Arial, sans-serif" font-size="18" font-weight="bold" 
              fill="${this.config.theme.textColor}">
          Interactive Timeline - ${events.length} Events
        </text>
        
        <!-- Timeline Controls -->
        ${options.zoomable ? this.generateZoomControls(svgWidth - 150, 10) : ""}
        
        <!-- Main Timeline Area -->
        <g transform="translate(${margin.left}, ${margin.top})">
          <!-- Timeline Base Line -->
          <line x1="0" y1="${timelineHeight / 2}" x2="${timelineWidth}" y2="${timelineHeight / 2}" 
                stroke="${this.config.theme.primaryColor}" stroke-width="3"/>
          
          <!-- Time Scale -->
          ${this.generateTimeScale(timelineWidth, timelineHeight)}
          
          <!-- Interactive Events -->
          ${this.generateInteractiveEvents(events, timelineWidth, timelineHeight, options)}
          
          <!-- Date Range Selector -->
          ${options.editMode ? this.generateDateRangeSelector(timelineWidth, timelineHeight) : ""}
        </g>
        
        <!-- Legend -->
        ${this.generateTimelineLegend(10, svgHeight - 70)}
        
        <!-- Interactive Scripts -->
        <script type="text/javascript">
          <![CDATA[
            ${this.generateTimelineEventHandlers(options)}
          ]]>
        </script>
      </svg>
    `;
  }

  /**
   * Generate interactive Gantt chart with drag-and-drop capabilities
   */
  generateInteractiveGantt(tasks: GanttTask[], options: InteractiveOptions): string {
    const svgWidth = 1000;
    const svgHeight = Math.max(400, tasks.length * 40 + 120);
    const margin = { top: 60, right: 50, bottom: 60, left: 200 };
    
    const chartWidth = svgWidth - margin.left - margin.right;
    const chartHeight = svgHeight - margin.top - margin.bottom;
    
    return `
      <svg width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg" 
           class="adpa-interactive-gantt" id="gantt-${Date.now()}">
        <defs>
          ${this.generateGanttDefinitions()}
        </defs>
        
        <!-- Background -->
        <rect width="100%" height="100%" fill="${this.config.theme.backgroundColor}"/>
        
        <!-- Title -->
        <text x="${svgWidth / 2}" y="30" text-anchor="middle" 
              font-family="Arial, sans-serif" font-size="18" font-weight="bold" 
              fill="${this.config.theme.textColor}">
          Interactive Gantt Chart - ${tasks.length} Tasks
        </text>
        
        <!-- Gantt Controls -->
        ${options.zoomable ? this.generateZoomControls(svgWidth - 150, 10) : ""}
        ${options.editMode ? this.generateGanttToolbar(10, 10) : ""}
        
        <!-- Main Chart Area -->
        <g transform="translate(${margin.left}, ${margin.top})">
          <!-- Time Grid -->
          ${this.generateTimeGrid(chartWidth, chartHeight, tasks)}
          
          <!-- Task List -->
          ${this.generateTaskList(tasks)}
          
          <!-- Interactive Task Bars -->
          ${this.generateInteractiveTaskBars(tasks, chartWidth, chartHeight, options)}
          
          <!-- Dependency Lines -->
          ${this.generateDependencyLines(tasks, chartWidth)}
        </g>
        
        <!-- Progress Legend -->
        ${this.generateGanttLegend(10, svgHeight - 50)}
        
        <!-- Interactive Scripts -->
        <script type="text/javascript">
          <![CDATA[
            ${this.generateGanttEventHandlers(options)}
          ]]>
        </script>
      </svg>
    `;
  }

  private generateTimelineDefinitions(): string {
    return `
      <!-- Event Markers -->
      <marker id="milestone-marker" markerWidth="10" markerHeight="10" 
              refX="5" refY="5" orient="auto">
        <circle cx="5" cy="5" r="4" fill="${this.config.theme.accentColor}"/>
      </marker>
      
      <!-- Gradient for Progress Bars -->
      <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style="stop-color:${this.config.theme.primaryColor};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${this.config.theme.secondaryColor};stop-opacity:1" />
      </linearGradient>
      
      <!-- Hover Effects -->
      <filter id="hover-glow">
        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
        <feMerge> 
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    `;
  }

  private generateGanttDefinitions(): string {
    return `
      <!-- Task Progress Patterns -->
      <pattern id="progress-pattern" patternUnits="userSpaceOnUse" width="4" height="4">
        <rect width="4" height="4" fill="${this.config.theme.backgroundColor}"/>
        <rect width="2" height="2" fill="${this.config.theme.accentColor}"/>
      </pattern>
      
      <!-- Dependency Arrow -->
      <marker id="dependency-arrow" markerWidth="10" markerHeight="10" 
              refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
        <path d="M0,0 L0,6 L9,3 z" fill="${this.config.theme.secondaryColor}"/>
      </marker>
      
      <!-- Drag Handle -->
      <circle id="drag-handle" r="3" fill="${this.config.theme.accentColor}" 
              stroke="${this.config.theme.primaryColor}" stroke-width="1"/>
    `;
  }

  private generateZoomControls(x: number, y: number): string {
    return `
      <g class="zoom-controls" transform="translate(${x}, ${y})">
        <rect x="0" y="0" width="120" height="30" fill="${this.config.theme.backgroundColor}" 
              stroke="${this.config.theme.primaryColor}" stroke-width="1" rx="5"/>
        
        <text x="60" y="20" text-anchor="middle" font-family="Arial" font-size="12" 
              fill="${this.config.theme.textColor}">Zoom Controls</text>
        
        <!-- Zoom Buttons -->
        <g class="zoom-buttons" transform="translate(10, 35)">
          <circle cx="15" cy="15" r="12" fill="${this.config.theme.primaryColor}" 
                  onclick="zoomIn()" class="clickable" style="cursor: pointer;">
            <title>Zoom In</title>
          </circle>
          <text x="15" y="20" text-anchor="middle" font-size="16" fill="white">+</text>
          
          <circle cx="45" cy="15" r="12" fill="${this.config.theme.secondaryColor}" 
                  onclick="zoomOut()" class="clickable" style="cursor: pointer;">
            <title>Zoom Out</title>
          </circle>
          <text x="45" y="20" text-anchor="middle" font-size="16" fill="white">−</text>
          
          <circle cx="75" cy="15" r="12" fill="${this.config.theme.accentColor}" 
                  onclick="resetZoom()" class="clickable" style="cursor: pointer;">
            <title>Reset Zoom</title>
          </circle>
          <text x="75" y="20" text-anchor="middle" font-size="12" fill="white">⌂</text>
        </g>
      </g>
    `;
  }

  private generateTimeScale(width: number, height: number): string {
    const scaleMarks = this.calculateTimeScaleMarks();
    let scaleHTML = "";
    
    scaleMarks.forEach((mark, index) => {
      const x = (index / (scaleMarks.length - 1)) * width;
      scaleHTML += `
        <line x1="${x}" y1="${height / 2 - 10}" x2="${x}" y2="${height / 2 + 10}" 
              stroke="${this.config.theme.textColor}" stroke-width="1"/>
        <text x="${x}" y="${height / 2 + 25}" text-anchor="middle" 
              font-family="Arial" font-size="10" fill="${this.config.theme.textColor}">
          ${mark.label}
        </text>
      `;
    });
    
    return scaleHTML;
  }

  private generateInteractiveEvents(
    events: TimelineEvent[],
    width: number,
    height: number,
    options: InteractiveOptions
  ): string {
    let eventsHTML = "";
    
    events.forEach((event) => {
      const x = this.calculateEventPosition(event.date, width);
      const y = height / 2;
      
      eventsHTML += `
        <g class="timeline-event${options.clickable ? " clickable" : ""}" 
           id="event-${event.id}"
           ${options.clickable ? `onclick="handleEventClick('${event.id}')"` : ""}
           style="${options.clickable ? "cursor: pointer;" : ""}">
          
          <!-- Event Marker -->
          <circle cx="${x}" cy="${y}" r="8" 
                  fill="${this.getEventColor(event.type)}" 
                  stroke="${this.config.theme.primaryColor}" stroke-width="2"
                  ${options.clickable ? 'class="hover-effect"' : ""}>
            <title>${event.title} - ${event.date.toLocaleDateString()}</title>
          </circle>
          
          <!-- Event Label -->
          <text x="${x}" y="${y - 15}" text-anchor="middle" 
                font-family="Arial" font-size="11" font-weight="bold" 
                fill="${this.config.theme.textColor}">
            ${event.title}
          </text>
          
          <!-- Event Date -->
          <text x="${x}" y="${y + 25}" text-anchor="middle" 
                font-family="Arial" font-size="9" 
                fill="${this.config.theme.textColor}">
            ${event.date.toLocaleDateString()}
          </text>
          
          ${options.draggable ? this.generateEventDragHandles(x, y) : ""}
        </g>
      `;
    });
    
    return eventsHTML;
  }

  private generateInteractiveTaskBars(
    tasks: GanttTask[],
    width: number,
    height: number,
    options: InteractiveOptions
  ): string {
    let tasksHTML = "";
    const taskHeight = 20;
    const taskSpacing = 40;
    
    tasks.forEach((task, index) => {
      const y = index * taskSpacing;
      const taskBarData = this.calculateTaskBarDimensions(task, width);
      
      tasksHTML += `
        <g class="gantt-task${options.draggable ? " draggable" : ""}" 
           id="task-${task.id}"
           ${options.clickable ? `onclick="handleTaskClick('${task.id}')"` : ""}
           style="${options.clickable || options.draggable ? "cursor: pointer;" : ""}">
          
          <!-- Task Background -->
          <rect x="${taskBarData.x}" y="${y}" 
                width="${taskBarData.width}" height="${taskHeight}" 
                fill="${this.config.theme.backgroundColor}" 
                stroke="${this.config.theme.primaryColor}" stroke-width="1" rx="3"/>
          
          <!-- Task Progress -->
          <rect x="${taskBarData.x}" y="${y}" 
                width="${taskBarData.width * (task.progress / 100)}" height="${taskHeight}" 
                fill="url(#progress-gradient)" rx="3">
            <title>${task.name} - ${task.progress}% Complete</title>
          </rect>
          
          <!-- Task Label -->
          <text x="${taskBarData.x + taskBarData.width / 2}" y="${y + taskHeight / 2 + 4}" 
                text-anchor="middle" font-family="Arial" font-size="10" 
                fill="${this.config.theme.textColor}">
            ${task.progress}%
          </text>
          
          ${options.draggable ? this.generateTaskDragHandles(taskBarData, y, taskHeight) : ""}
        </g>
      `;
    });
    
    return tasksHTML;
  }

  private generateTimelineEventHandlers(options: InteractiveOptions): string {
    return `
      // Timeline Event Handlers
      function handleEventClick(eventId) {
        console.log('Timeline event clicked:', eventId);
        ${
          options.clickable
            ? `
        if (window.parent && window.parent.timelineEventClickHandler) {
          window.parent.timelineEventClickHandler(eventId);
        }
        `
            : ""
        }
      }
      
      function zoomIn() {
        console.log('Zoom in clicked');
        ${
          options.zoomable
            ? `
        if (window.parent && window.parent.timelineZoomHandler) {
          window.parent.timelineZoomHandler('in');
        }
        `
            : ""
        }
      }
      
      function zoomOut() {
        console.log('Zoom out clicked');
        ${
          options.zoomable
            ? `
        if (window.parent && window.parent.timelineZoomHandler) {
          window.parent.timelineZoomHandler('out');
        }
        `
            : ""
        }
      }
      
      function resetZoom() {
        console.log('Reset zoom clicked');
        ${
          options.zoomable
            ? `
        if (window.parent && window.parent.timelineZoomHandler) {
          window.parent.timelineZoomHandler('reset');
        }
        `
            : ""
        }
      }
      
      // Add hover effects
      document.addEventListener('DOMContentLoaded', function() {
        const events = document.querySelectorAll('.timeline-event');
        events.forEach(event => {
          event.addEventListener('mouseenter', function() {
            this.style.filter = 'url(#hover-glow)';
          });
          event.addEventListener('mouseleave', function() {
            this.style.filter = 'none';
          });
        });
      });
    `;
  }

  private generateGanttEventHandlers(options: InteractiveOptions): string {
    return `
      // Gantt Chart Event Handlers
      function handleTaskClick(taskId) {
        console.log('Gantt task clicked:', taskId);
        ${
          options.clickable
            ? `
        if (window.parent && window.parent.ganttTaskClickHandler) {
          window.parent.ganttTaskClickHandler(taskId);
        }
        `
            : ""
        }
      }
      
      // Drag and Drop Implementation
      ${
        options.draggable
          ? `
      let isDragging = false;
      let draggedTask = null;
      let startX = 0;
      
      document.addEventListener('mousedown', function(e) {
        if (e.target.classList.contains('drag-handle')) {
          isDragging = true;
          draggedTask = e.target.closest('.gantt-task');
          startX = e.clientX;
          e.preventDefault();
        }
      });
      
      document.addEventListener('mousemove', function(e) {
        if (isDragging && draggedTask) {
          const deltaX = e.clientX - startX;
          // Update task position
          const taskRect = draggedTask.querySelector('rect');
          const newX = parseFloat(taskRect.getAttribute('x')) + deltaX;
          taskRect.setAttribute('x', newX);
          startX = e.clientX;
        }
      });
      
      document.addEventListener('mouseup', function(e) {
        if (isDragging) {
          isDragging = false;
          if (draggedTask && window.parent && window.parent.ganttTaskDragHandler) {
            const taskId = draggedTask.id.replace('task-', '');
            window.parent.ganttTaskDragHandler(taskId);
          }
          draggedTask = null;
        }
      });
      `
          : ""
      }
    `;
  }

  // Helper methods
  private calculateTimeScaleMarks(): Array<{ label: string; date: Date }> {
    const marks = [];
    const startDate = this.selectedDateRange.start;
    const endDate = this.selectedDateRange.end;
    const totalDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    
    if (totalDays <= 31) {
      // Daily marks
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        marks.push({
          label: d.getDate().toString(),
          date: new Date(d),
        });
      }
    } else if (totalDays <= 365) {
      // Monthly marks
      for (let d = new Date(startDate); d <= endDate; d.setMonth(d.getMonth() + 1)) {
        marks.push({
          label: d.toLocaleDateString("en-US", { month: "short" }),
          date: new Date(d),
        });
      }
    } else {
      // Yearly marks
      for (let d = new Date(startDate); d <= endDate; d.setFullYear(d.getFullYear() + 1)) {
        marks.push({
          label: d.getFullYear().toString(),
          date: new Date(d),
        });
      }
    }
    
    return marks;
  }

  private calculateEventPosition(eventDate: Date, width: number): number {
    const totalDuration = this.selectedDateRange.end.getTime() - this.selectedDateRange.start.getTime();
    const eventOffset = eventDate.getTime() - this.selectedDateRange.start.getTime();
    return (eventOffset / totalDuration) * width;
  }

  private getEventColor(type: string): string {
    switch (type) {
      case "milestone":
        return this.config.theme.accentColor;
      case "deadline":
        return "#FF6B6B";
      case "event":
        return this.config.theme.primaryColor;
      default:
        return this.config.theme.secondaryColor;
    }
  }

  private calculateTaskBarDimensions(task: GanttTask, width: number): { x: number; width: number } {
    const totalDuration = this.selectedDateRange.end.getTime() - this.selectedDateRange.start.getTime();
    const taskStart = task.startDate.getTime() - this.selectedDateRange.start.getTime();
    const taskDuration = task.endDate.getTime() - task.startDate.getTime();
    
    return {
      x: (taskStart / totalDuration) * width,
      width: (taskDuration / totalDuration) * width,
    };
  }

  private generateEventDragHandles(x: number, y: number): string {
    return `
      <circle cx="${x - 6}" cy="${y}" r="3" class="drag-handle" 
              fill="${this.config.theme.accentColor}" style="cursor: grab;">
        <title>Drag to adjust event date</title>
      </circle>
      <circle cx="${x + 6}" cy="${y}" r="3" class="drag-handle" 
              fill="${this.config.theme.accentColor}" style="cursor: grab;">
        <title>Drag to adjust event date</title>
      </circle>
    `;
  }

  private generateTaskDragHandles(taskBarData: any, y: number, height: number): string {
    return `
      <!-- Start Date Handle -->
      <circle cx="${taskBarData.x}" cy="${y + height / 2}" r="4" class="drag-handle" 
              fill="${this.config.theme.accentColor}" stroke="white" stroke-width="1" 
              style="cursor: ew-resize;">
        <title>Drag to adjust start date</title>
      </circle>
      
      <!-- End Date Handle -->
      <circle cx="${taskBarData.x + taskBarData.width}" cy="${y + height / 2}" r="4" class="drag-handle" 
              fill="${this.config.theme.accentColor}" stroke="white" stroke-width="1" 
              style="cursor: ew-resize;">
        <title>Drag to adjust end date</title>
      </circle>
    `;
  }

  private generateTimelineLegend(x: number, y: number): string {
    return `
      <g class="timeline-legend" transform="translate(${x}, ${y})">
        <text x="0" y="0" font-family="Arial" font-size="12" font-weight="bold" 
              fill="${this.config.theme.textColor}">Legend:</text>
        
        <circle cx="10" cy="15" r="4" fill="${this.config.theme.primaryColor}"/>
        <text x="20" y="19" font-family="Arial" font-size="10" 
              fill="${this.config.theme.textColor}">Events</text>
        
        <circle cx="70" cy="15" r="4" fill="${this.config.theme.accentColor}"/>
        <text x="80" y="19" font-family="Arial" font-size="10" 
              fill="${this.config.theme.textColor}">Milestones</text>
        
        <circle cx="140" cy="15" r="4" fill="#FF6B6B"/>
        <text x="150" y="19" font-family="Arial" font-size="10" 
              fill="${this.config.theme.textColor}">Deadlines</text>
      </g>
    `;
  }

  private generateGanttLegend(x: number, y: number): string {
    return `
      <g class="gantt-legend" transform="translate(${x}, ${y})">
        <text x="0" y="0" font-family="Arial" font-size="12" font-weight="bold" 
              fill="${this.config.theme.textColor}">Progress:</text>
        
        <rect x="60" y="-8" width="30" height="8" fill="url(#progress-gradient)"/>
        <text x="95" y="0" font-family="Arial" font-size="10" 
              fill="${this.config.theme.textColor}">Completed</text>
        
        <rect x="150" y="-8" width="30" height="8" fill="${this.config.theme.backgroundColor}" 
              stroke="${this.config.theme.primaryColor}" stroke-width="1"/>
        <text x="185" y="0" font-family="Arial" font-size="10" 
              fill="${this.config.theme.textColor}">Remaining</text>
      </g>
    `;
  }

  private generateTimeGrid(width: number, height: number, tasks: GanttTask[]): string {
    const timeMarks = this.calculateTimeScaleMarks();
    let gridHTML = "";
    
    // Vertical grid lines
    timeMarks.forEach((mark, index) => {
      const x = (index / (timeMarks.length - 1)) * width;
      gridHTML += `
        <line x1="${x}" y1="0" x2="${x}" y2="${height}" 
              stroke="${this.config.theme.textColor}" stroke-width="0.5" opacity="0.3"/>
        <text x="${x}" y="-5" text-anchor="middle" 
              font-family="Arial" font-size="10" fill="${this.config.theme.textColor}">
          ${mark.label}
        </text>
      `;
    });
    
    // Horizontal grid lines
    tasks.forEach((task, index) => {
      const y = index * 40;
      gridHTML += `
        <line x1="0" y1="${y}" x2="${width}" y2="${y}" 
              stroke="${this.config.theme.textColor}" stroke-width="0.5" opacity="0.2"/>
      `;
    });
    
    return gridHTML;
  }

  private generateTaskList(tasks: GanttTask[]): string {
    let taskListHTML = "";
    
    tasks.forEach((task, index) => {
      const y = index * 40;
      taskListHTML += `
        <text x="-10" y="${y + 15}" text-anchor="end" 
              font-family="Arial" font-size="11" font-weight="bold" 
              fill="${this.config.theme.textColor}">
          ${task.name}
        </text>
        <text x="-10" y="${y + 28}" text-anchor="end" 
              font-family="Arial" font-size="9" 
              fill="${this.config.theme.textColor}">
          ${task.assignee || "Unassigned"}
        </text>
      `;
    });
    
    return taskListHTML;
  }

  private generateDependencyLines(tasks: GanttTask[], width: number): string {
    let dependencyHTML = "";
    
    tasks.forEach((task, taskIndex) => {
      task.dependencies.forEach((depId) => {
        const depIndex = tasks.findIndex((t) => t.id === depId);
        if (depIndex !== -1) {
          const fromY = depIndex * 40 + 10;
          const toY = taskIndex * 40 + 10;
          const fromX =
            this.calculateTaskBarDimensions(tasks[depIndex], width).x +
            this.calculateTaskBarDimensions(tasks[depIndex], width).width;
          const toX = this.calculateTaskBarDimensions(task, width).x;
          
          dependencyHTML += `
            <path d="M ${fromX} ${fromY} L ${toX - 10} ${fromY} L ${toX - 10} ${toY} L ${toX} ${toY}" 
                  stroke="${this.config.theme.secondaryColor}" stroke-width="2" 
                  fill="none" marker-end="url(#dependency-arrow)">
              <title>Dependency: ${tasks[depIndex].name} → ${task.name}</title>
            </path>
          `;
        }
      });
    });
    
    return dependencyHTML;
  }

  private generateDateRangeSelector(width: number, height: number): string {
    return `
      <g class="date-range-selector" transform="translate(0, ${height + 20})">
        <text x="0" y="0" font-family="Arial" font-size="12" 
              fill="${this.config.theme.textColor}">Date Range:</text>
        
        <rect x="70" y="-15" width="120" height="20" 
              fill="${this.config.theme.backgroundColor}" 
              stroke="${this.config.theme.primaryColor}" stroke-width="1" rx="3"/>
        <text x="130" y="-2" text-anchor="middle" font-family="Arial" font-size="10" 
              fill="${this.config.theme.textColor}">Select Range</text>
      </g>
    `;
  }

  private generateGanttToolbar(x: number, y: number): string {
    return `
      <g class="gantt-toolbar" transform="translate(${x}, ${y})">
        <rect x="0" y="0" width="200" height="30" 
              fill="${this.config.theme.backgroundColor}" 
              stroke="${this.config.theme.primaryColor}" stroke-width="1" rx="5"/>
        
        <text x="100" y="20" text-anchor="middle" font-family="Arial" font-size="12" 
              fill="${this.config.theme.textColor}">Edit Mode Tools</text>
        
        <!-- Add Task Button -->
        <circle cx="220" cy="15" r="12" fill="${this.config.theme.accentColor}" 
                onclick="addNewTask()" class="clickable" style="cursor: pointer;">
          <title>Add New Task</title>
        </circle>
        <text x="220" y="20" text-anchor="middle" font-size="16" fill="white">+</text>
      </g>
    `;
  }

  /**
   * Update timeline events
   */
  updateTimelineEvents(events: TimelineEvent[]): void {
    this.events = events;
    if (this.config.handlers.onDateRangeChange) {
      this.config.handlers.onDateRangeChange(this.selectedDateRange);
    }
  }

  /**
   * Set zoom level
   */
  setZoomLevel(zoomLevel: ZoomLevel): void {
    this.currentZoom = zoomLevel;
    if (this.config.handlers.onZoomChange) {
      this.config.handlers.onZoomChange(zoomLevel);
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): InteractiveConfig {
    return this.config;
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<InteractiveConfig>): void {
    this.config = { ...this.config, ...updates };
  }
}
