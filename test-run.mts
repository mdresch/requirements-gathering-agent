import { generateStrategicSections, generateRequirements } from './index.js';
import { mkdir, writeFile } from 'fs/promises';

(async () => {
  // Ensure docs directory exists
  try {
    await mkdir('./requirements-gathering-agent/docs', { recursive: true });
  } catch (err) {
    console.error('Error creating docs directory:', err);
  }

  // Step 1: Generate strategic sections
  const strategic = await generateStrategicSections({
    businessProblem: 'A SaaS platform for remote team collaboration',
    technologyStack: ["Node.js", "React", "PostgreSQL"],
    contextBundle: 'The platform enables real-time chat, file sharing, and project management for distributed teams.'
  });
  console.log('Strategic:', strategic);

  // Step 2: Generate requirements
  const requirements = await generateRequirements({
    businessProblem: 'A SaaS platform for remote team collaboration',
    technologyStack: ["Node.js", "React", "PostgreSQL"],
    contextBundle: 'The platform enables real-time chat, file sharing, and project management for distributed teams.'
  });
  console.log('Requirements:', requirements);

  // Step 3: Write outputs to files with granular error handling
  const techStackDoc = `# Technology Stack\n\n${["Node.js", "React", "PostgreSQL"].map(t => `- ${t}`).join('\n')}`;
  const processFlowsDoc = `# Process Flows\n\n- Real-time chat workflow\n- File sharing workflow\n- Project management workflow`;
  const dataModelDoc = `# Data Model\n\n- User\n- Team\n- Message\n- File\n- Project\n- Task`;
  const businessStatement = `# Business Statement\n\n**Vision:** ${strategic.vision}\n\n**Mission:** ${strategic.mission}\n\n**Core Values:**\n${strategic.coreValues.map(v => `- ${v}`).join('\n')}\n\n**Purpose:** ${strategic.purpose}\n`;

  // Format requirements as Markdown with business problem statement
  const businessProblem = 'A SaaS platform for remote team collaboration';
  function requirementsToMarkdown(requirements, businessProblem) {
    let md = `# Requirements Statement\n\n**Business Problem:** ${businessProblem}\n\n`;
    md += requirements.map(r => `## Role: ${r.role}\n\n**Needs:**\n${r.needs.map(n => `- ${n}`).join('\n')}\n\n**Processes:**\n${r.processes.map(p => `- ${p}`).join('\n')}\n`).join('\n');
    return md;
  }
  const requirementsMarkdown = requirementsToMarkdown(requirements, businessProblem);

  try {
    await writeFile('./requirements-gathering-agent/docs/business-statement.md', businessStatement);
    console.log('Wrote business-statement.md');
  } catch (err) {
    console.error('Error writing business-statement.md:', err);
  }
  try {
    await writeFile('./requirements-gathering-agent/docs/technology-stack.md', techStackDoc);
    console.log('Wrote technology-stack.md');
  } catch (err) {
    console.error('Error writing technology-stack.md:', err);
  }
  try {
    await writeFile('./requirements-gathering-agent/docs/process-flows.md', processFlowsDoc);
    console.log('Wrote process-flows.md');
  } catch (err) {
    console.error('Error writing process-flows.md:', err);
  }
  try {
    await writeFile('./requirements-gathering-agent/docs/data-model.md', dataModelDoc);
    console.log('Wrote data-model.md');
  } catch (err) {
    console.error('Error writing data-model.md:', err);
  }
  try {
    await writeFile('./requirements-gathering-agent/docs/requirements-agent-output.md', requirementsMarkdown);
    console.log('Wrote requirements-agent-output.md');
  } catch (err) {
    console.error('Error writing requirements-agent-output.md:', err);
  }

  console.log('All documentation generation attempts complete.');
})();
