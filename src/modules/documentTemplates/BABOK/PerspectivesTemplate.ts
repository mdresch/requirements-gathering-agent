import { ProjectContext } from '../../types';

/**
 * Template for the BABOK Perspectives document.
 * Provides the structure and default content for the Perspectives section.
 */
export class PerspectivesTemplate {
  /**
   * Generates the content for the Perspectives document.
   * @param context ProjectContext containing relevant project information.
   * @returns The structured Perspectives document as a string.
   */
  generateContent(context: ProjectContext): string {
    return `# Perspectives

This section provides an overview of the various perspectives as defined in the BABOK Guide. Perspectives are used within business analysis work to provide focus to tasks and techniques specific to the context of the initiative.

## Typical Perspectives
- Agile
- Business Intelligence
- Information Technology
- Business Architecture
- Business Process Management

## Perspective Details
For each perspective, consider the following:
- Key characteristics
- Impact on business analysis work
- Techniques and approaches
- Stakeholder considerations

---

*This template should be customized to reflect the specific perspectives relevant to your project or organization. Use the context provided to tailor the content as needed.*
`;
  }
}
