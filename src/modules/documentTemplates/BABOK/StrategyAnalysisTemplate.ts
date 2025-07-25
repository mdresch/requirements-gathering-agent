import { ProjectContext } from '../../types';

/**
 * StrategyAnalysisTemplate generates the structure and default content for the BABOK Strategy Analysis document.
 */
export class StrategyAnalysisTemplate {
  /**
   * Generate the default content for the Strategy Analysis document.
   * @param context ProjectContext for dynamic content (if needed)
   */
  generateContent(context: ProjectContext): string {
    return `# Strategy Analysis

**Category:** BABOK

## Purpose
Describes the tasks and techniques used to identify business needs, address those needs, and align the change strategy for the enterprise.

## Key Activities
- Analyze current state
- Define future state
- Assess risks
- Define change strategy

## Checklist
- [ ] Current state analysis completed
- [ ] Future state defined
- [ ] Risks assessed and documented
- [ ] Change strategy developed and approved

## Summary
Strategy Analysis enables organizations to identify and articulate business needs, define desired outcomes, and develop strategies to achieve those outcomes. It ensures alignment between business goals and change initiatives.

## Revision History
- ${new Date().toISOString().slice(0, 10)}: Initial version generated by ADPA Document Generator.
`;
  }
}
