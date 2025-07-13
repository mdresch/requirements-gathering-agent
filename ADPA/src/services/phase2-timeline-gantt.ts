/**
 * Phase 2 Timeline and Gantt Chart Implementation
 * Advanced diagram parsing for project management workflows
 */

interface TimelineEvent {
  date: string;
  title: string;
  description?: string;
  category?: string;
  milestone?: boolean;
}

interface TimelineData {
  events: TimelineEvent[];
  dateRange: { start: string; end: string };
  categories: string[];
}

interface GanttTask {
  id: string;
  name: string;
  start: string;
  end: string;
  duration?: number;
  dependencies?: string[];
  progress?: number;
  assignee?: string;
  priority?: "high" | "medium" | "low";
}

interface GanttMilestone {
  id: string;
  name: string;
  date: string;
  dependencies?: string[];
}

interface GanttChartData {
  tasks: GanttTask[];
  milestones: GanttMilestone[];
  dateRange: { start: string; end: string };
}

export class TimelineGanttParser {
  /**
   * Parse timeline events from text content
   */
  static parseTimelineEvents(content: string): TimelineEvent[] {
    const events: TimelineEvent[] = [];
    const lines = content.split("\n");

    for (const line of lines) {
      // Match various date formats
      const dateMatch = line.match(/(\d{4}[-/]\d{1,2}[-/]\d{1,2}|\w+ \d{1,2},? \d{4})/);
      const titleMatch = line.match(/[-:]\s*(.+)$/);

      if (dateMatch && titleMatch) {
        events.push({
          date: this.standardizeDate(dateMatch[1]),
          title: titleMatch[1].trim(),
          description: this.extractDescription(line),
          milestone: line.toLowerCase().includes("milestone"),
          category: this.extractCategory(line),
        });
      }
    }

    return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  /**
   * Parse Gantt chart tasks and milestones
   */
  static parseGanttTasks(content: string): { tasks: GanttTask[]; milestones: GanttMilestone[] } {
    const tasks: GanttTask[] = [];
    const milestones: GanttMilestone[] = [];
    const lines = content.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Parse task format: "Task Name | Start Date | End Date | Assignee"
      const taskMatch = line.match(/^([^|]+)\|([^|]+)\|([^|]+)(?:\|([^|]+))?/);
      if (taskMatch) {
        const [, name, start, end, assignee] = taskMatch;
        tasks.push({
          id: `task-${i}`,
          name: name.trim(),
          start: this.standardizeDate(start.trim()),
          end: this.standardizeDate(end.trim()),
          assignee: assignee?.trim(),
          dependencies: this.extractDependencies(line),
          progress: this.extractProgress(line),
          priority: this.extractPriority(line),
        });
      }

      // Parse milestone format
      if (line.toLowerCase().includes("milestone")) {
        const milestoneMatch = line.match(/milestone\s*:?\s*([^|]+?)(?:\s*\|\s*([^|]+))?/i);
        if (milestoneMatch) {
          milestones.push({
            id: `milestone-${i}`,
            name: milestoneMatch[1].trim(),
            date: this.standardizeDate(milestoneMatch[2]?.trim() || ""),
            dependencies: this.extractDependencies(line),
          });
        }
      }
    }

    return { tasks, milestones };
  }

  /**
   * Calculate date range from events
   */
  static calculateDateRange(events: TimelineEvent[]): { start: string; end: string } {
    if (events.length === 0) return { start: "", end: "" };

    const dates = events.map((e) => new Date(e.date)).sort((a, b) => a.getTime() - b.getTime());
    return {
      start: dates[0].toISOString().split("T")[0],
      end: dates[dates.length - 1].toISOString().split("T")[0],
    };
  }

  /**
   * Calculate date range from tasks and milestones
   */
  static calculateTaskDateRange(tasks: GanttTask[], milestones: GanttMilestone[]): { start: string; end: string } {
    const allDates: Date[] = [];

    tasks.forEach((task) => {
      allDates.push(new Date(task.start), new Date(task.end));
    });

    milestones.forEach((milestone) => {
      allDates.push(new Date(milestone.date));
    });

    if (allDates.length === 0) return { start: "", end: "" };

    allDates.sort((a, b) => a.getTime() - b.getTime());
    return {
      start: allDates[0].toISOString().split("T")[0],
      end: allDates[allDates.length - 1].toISOString().split("T")[0],
    };
  }

  /**
   * Helper methods
   */
  private static standardizeDate(dateStr: string): string {
    if (!dateStr) return new Date().toISOString().split("T")[0];

    try {
      const date = new Date(dateStr);
      return date.toISOString().split("T")[0];
    } catch {
      return new Date().toISOString().split("T")[0];
    }
  }

  private static extractDescription(line: string): string | undefined {
    const descMatch = line.match(/\(([^)]+)\)/);
    return descMatch ? descMatch[1] : undefined;
  }

  private static extractCategory(line: string): string | undefined {
    const categoryMatch = line.match(/\[([^\]]+)\]/);
    return categoryMatch ? categoryMatch[1] : undefined;
  }

  private static extractDependencies(line: string): string[] {
    const depMatch = line.match(/depends?\s*on\s*:?\s*([^|,\n]+)/i);
    if (!depMatch) return [];

    return depMatch[1]
      .split(",")
      .map((dep) => dep.trim())
      .filter(Boolean);
  }

  private static extractProgress(line: string): number | undefined {
    const progressMatch = line.match(/(\d+)%/);
    return progressMatch ? parseInt(progressMatch[1]) : undefined;
  }

  private static extractPriority(line: string): "high" | "medium" | "low" | undefined {
    const lower = line.toLowerCase();
    if (lower.includes("high") || lower.includes("critical")) return "high";
    if (lower.includes("low")) return "low";
    if (lower.includes("medium") || lower.includes("normal")) return "medium";
    return undefined;
  }

  private static extractCategories(events: TimelineEvent[]): string[] {
    const categories = new Set<string>();
    events.forEach((event) => {
      if (event.category) categories.add(event.category);
    });
    return Array.from(categories);
  }
}

export { TimelineData, GanttChartData, TimelineEvent, GanttTask, GanttMilestone };
