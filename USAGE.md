# requirements-gathering-agent

Reusable LLM-powered requirements gathering agent for any project.

## Usage Example

```ts
import { generateStrategicSections, generateRequirements } from 'requirements-gathering-agent';

const strategic = await generateStrategicSections({
  businessProblem: 'Describe your business problem here',
  technologyStack: ['TypeScript', 'Next.js'],
  contextBundle: 'Additional context here'
});

console.log(strategic.vision, strategic.mission, strategic.coreValues, strategic.purpose);

const requirements = await generateRequirements({
  businessProblem: 'Describe your business problem here',
  technologyStack: ['TypeScript', 'Next.js'],
  contextBundle: 'Additional context here'
});

console.log(requirements);
```

## Using a High-Token LLM Model

To process or generate large PMBOK documents, set the environment variable `REQUIREMENTS_AGENT_MODEL` to a model with a high token limit (e.g., GPT-4-32k, Claude 3, etc.).

**Example:**
```bash
export REQUIREMENTS_AGENT_MODEL="openai/gpt-4-32k"
```

Or add to your `.env` file:
```
REQUIREMENTS_AGENT_MODEL=openai/gpt-4-32k
```

This ensures the agent uses a model capable of handling large documents.

---
MIT License
