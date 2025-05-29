# Requirements Gathering Agent

A reusable Node.js/TypeScript module for automated requirements gathering using LLMs. Generates project-specific vision, mission, core values, and purpose statements, as well as user roles and requirements, for any software project.

## Features
- Accepts business problem, technology stack, and context bundle as input
- Calls an LLM (or mock) to generate:
  - Vision, mission, core values, and purpose
  - User roles, needs, and processes
- Enforces strict JSON output for easy integration
- Can be used in any project, not just Next.js or portfolio platforms

## Usage

```
npm install requirements-gathering-agent
```

```ts
import { generateRequirements, generateStrategicSections } from 'requirements-gathering-agent';

const result = await generateStrategicSections({
  businessProblem: 'Describe your business problem here',
  technologyStack: ['TypeScript', 'Next.js'],
  contextBundle: 'Additional context here'
});

console.log(result.vision, result.mission, result.coreValues, result.purpose);
```

## API

### generateStrategicSections({ businessProblem, technologyStack, contextBundle })
Returns: `{ vision, mission, coreValues, purpose }`

### generateRequirements({ businessProblem, technologyStack, contextBundle })
Returns: `[{ role, needs, processes }]`

# requirements-gathering-agent: Usage in Any Project

This agent can be used in any Node.js/TypeScript project to automate requirements documentation generation using LLMs.

## How to Use in a New Project

1. **Copy the Folder**
   - Copy the entire `requirements-gathering-agent` directory into your new project (e.g., in the root or a `libs/` folder).

2. **Install Dependencies**
   - In your new project, run:
     ```bash
     npm install @azure-rest/ai-inference @azure/core-auth
     ```

3. **Import and Use**
   - In your code, import the agent:
     ```typescript
     import { generateStrategicSections, generateRequirements } from './requirements-gathering-agent/index.js';
     ```
   - Call the functions:
     ```typescript
     const strategic = await generateStrategicSections({ businessProblem, technologyStack, contextBundle });
     const requirements = await generateRequirements({ businessProblem, technologyStack, contextBundle });
     ```

4. **Write Output (Optional)**
   - Use Node's `fs/promises` to write output to files, e.g.:
     ```typescript
     import { writeFile } from 'fs/promises';
     await writeFile('./docs/business-statement.md', businessStatement);
     ```

5. **(Optional) Publish as a Package**
   - For multi-project use, publish to npm or GitHub Packages and install via npm.

## Example: Minimal Script

```typescript
import { generateStrategicSections, generateRequirements } from './requirements-gathering-agent/index.js';
import { writeFile } from 'fs/promises';

(async () => {
  const strategic = await generateStrategicSections({
    businessProblem: 'A SaaS platform for remote team collaboration',
    technologyStack: ['Node.js', 'React', 'PostgreSQL'],
    contextBundle: 'The platform enables real-time chat, file sharing, and project management for distributed teams.'
  });
  const requirements = await generateRequirements({
    businessProblem: 'A SaaS platform for remote team collaboration',
    technologyStack: ['Node.js', 'React', 'PostgreSQL'],
    contextBundle: 'The platform enables real-time chat, file sharing, and project management for distributed teams.'
  });
  await writeFile('./docs/business-statement.md', JSON.stringify(strategic, null, 2));
  await writeFile('./docs/requirements.json', JSON.stringify(requirements, null, 2));
})();
```

---

**Note:** If you encounter file writing issues, check your environment's file system permissions and workspace mapping.

---

MIT License
