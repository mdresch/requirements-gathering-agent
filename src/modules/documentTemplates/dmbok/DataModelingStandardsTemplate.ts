import type { ProjectContext } from '../../ai/types.js';

/**
 * Generates the content for the Data Modeling Standards Guide document.
 * @param context Project context and relationships
 * @returns Markdown string for the Data Modeling Standards Guide
 */
export function generateContent(context: ProjectContext): string {
  return `# Data Modeling Standards Guide\n\n## 1. Introduction\n- Purpose and Scope\n- Intended Audience\n- Document Conventions\n\n## 2. Data Modeling Standards\n- Naming Conventions\n- Abbreviation Standards\n- Data Types and Domains\n- Null Handling\n- Modeling Notation Standards (e.g., Crow's Foot, IDEF1X, UML)\n\n## 3. Conceptual Data Model\n- Entity Definitions\n- Relationship Rules\n- Business Rules\n- Example Diagrams\n\n## 4. Logical Data Model\n- Attribute Definitions\n- Primary and Foreign Keys\n- Normalization Rules\n- Denormalization Guidelines\n\n## 5. Physical Data Model\n- Table Design\n- Indexing Strategy\n- Partitioning Guidelines\n- Storage Parameters\n\n## 6. Model Management\n- Version Control\n- Change Management\n- Model Validation\n- Documentation Requirements\n\n## 7. Tools and Technologies\n- Modeling Tools\n- Reverse Engineering\n- Forward Engineering\n- Model Comparison\n\n## 8. Appendices\n- Glossary\n- Naming Convention Examples\n- Common Patterns\n- Anti-patterns to Avoid\n`;
}
