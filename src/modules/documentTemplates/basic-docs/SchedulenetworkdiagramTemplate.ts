import type { ProjectContext } from '../../ai/types';

/**
 * Schedule Network Diagram Template generates comprehensive content for project schedule network diagrams.
 */
export class SchedulenetworkdiagramTemplate {
  constructor(private context: ProjectContext) {}

  /**
   * Build the markdown content for Schedule Network Diagram
   */
  generateContent(): string {
    const projectName = this.context.projectName || 'Project';
    const projectType = this.context.projectType || 'Software Development';
    
    return `# Schedule Network Diagram

## Document Overview
**Project:** ${projectName}
**Project Type:** ${projectType}
**Document Purpose:** Define the logical relationships and dependencies between project activities

## Network Diagram Methodology
- **Precedence Diagramming Method (PDM)** - Activity-on-Node (AON)
- **Dependency Types:** Finish-to-Start (FS), Start-to-Start (SS), Finish-to-Finish (FF), Start-to-Finish (SF)
- **Lead and Lag Time** considerations
- **Critical Path Method (CPM)** for schedule optimization

## Activity Network Structure

### Phase 1: Project Initiation
\`\`\`
[Project Charter] → [Stakeholder Register] → [Initial Risk Assessment]
     ↓                    ↓                        ↓
[Project Kickoff] ← [Stakeholder Analysis] ← [Risk Register]
\`\`\`

### Phase 2: Planning
\`\`\`
[Scope Definition] → [WBS Creation] → [Activity Definition]
        ↓               ↓               ↓
[Requirements] → [Resource Planning] → [Schedule Development]
        ↓               ↓               ↓
[Quality Plan] → [Risk Management] → [Communication Plan]
\`\`\`

### Phase 3: Execution
\`\`\`
[Development Setup] → [Core Development] → [Integration Testing]
        ↓                   ↓                    ↓
[Documentation] → [Quality Assurance] → [User Acceptance Testing]
\`\`\`

### Phase 4: Monitoring & Control
\`\`\`
[Progress Monitoring] → [Performance Analysis] → [Change Control]
        ↓                      ↓                     ↓
[Status Reporting] → [Risk Monitoring] → [Quality Control]
\`\`\`

### Phase 5: Closure
\`\`\`
[Final Testing] → [Deployment] → [Project Closure]
      ↓             ↓              ↓
[Documentation] → [Handover] → [Lessons Learned]
\`\`\`

## Critical Path Analysis
- **Critical Path:** Longest sequence of dependent activities
- **Float/Slack:** Available time flexibility for non-critical activities
- **Resource Leveling:** Optimization of resource allocation
- **Schedule Compression:** Fast-tracking and crashing techniques

## Dependency Management
### External Dependencies
- Third-party integrations
- Vendor deliverables
- Regulatory approvals
- Infrastructure availability

### Internal Dependencies
- Team availability
- Resource allocation
- Technical prerequisites
- Knowledge transfer requirements

## Network Diagram Maintenance
- **Update Frequency:** Weekly during active phases
- **Change Control:** All network changes require approval
- **Version Control:** Maintain historical versions
- **Stakeholder Communication:** Share updates with project team

## Integration with Other Planning Documents
- **WBS Integration:** Activities derived from work packages
- **Resource Calendar:** Align with resource availability
- **Risk Register:** Incorporate risk mitigation activities
- **Quality Plan:** Include quality checkpoints and reviews

## Tools and Techniques
- **Software Tools:** Microsoft Project, Primavera P6, or similar
- **Manual Methods:** Sticky notes, whiteboard diagrams
- **Collaborative Platforms:** Online project management tools
- **Visualization:** Gantt charts, PERT charts, network diagrams`;
  }
}
