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

---
MIT License
