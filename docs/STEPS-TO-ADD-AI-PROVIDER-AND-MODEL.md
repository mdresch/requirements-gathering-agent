# Step-by-Step Guide: Adding a New AI Provider and Model

This guide explains how to add a new AI provider and model to the Requirements Gathering Agent project.

---

## Prerequisites
- Familiarity with TypeScript and Node.js
- Understanding of the project structure (see `ARCHITECTURE.md`)
- Access to the provider's API documentation and credentials (API key, endpoint, etc.)

---

## 1. Define the Provider in `provider-definitions.ts`

**File:** `src/modules/ai/provider-definitions.ts`

- Add a new entry to the `PROVIDER_DEFINITIONS` array.
- Specify:
  - `id`, `name`, `description`, `requiredEnvVars`, `features`, `cost`, `setupGuide`, etc.
  - Implement `check`, `isAvailable`, and `getStatus` methods for configuration and health checks.

**Example:**
```ts
{
  id: 'my-ai-provider',
  name: 'My AI Provider',
  description: 'Custom AI integration',
  requiredEnvVars: ['MY_AI_API_KEY', 'MY_AI_ENDPOINT'],
  features: ['Custom models', 'Fast inference'],
  cost: 'See provider pricing',
  setupGuide: [
    'Obtain an API key from your provider dashboard.',
    'Set MY_AI_API_KEY and MY_AI_ENDPOINT in your .env file.'
  ],
  check: () => !!(process.env.MY_AI_API_KEY && process.env.MY_AI_ENDPOINT),
  isAvailable: async () => {
    // Implement a quick health check (e.g., fetch endpoint with API key)
    return true;
  },
  getStatus: async () => {
    // Return a status object for the provider
    return { configured: true, available: true, connected: true };
  }
}
```

---

## 2. Add Client Logic in `AIClientManager.ts`

**File:** `src/modules/ai/AIClientManager.ts`

- Add a method to initialize the new provider (e.g., `initializeMyAIProvider`).
- Use environment variables for configuration.
- Implement authentication, request formatting, and error handling.
- Register the new provider in the client manager's provider map.

**Example:**
```ts
private async initializeMyAIProvider() {
  const apiKey = this.config.get<string>('MY_AI_API_KEY');
  const endpoint = this.config.get<string>('MY_AI_ENDPOINT');
  if (!apiKey || !endpoint) throw new Error('Missing My AI Provider configuration');
  // Set up client instance, e.g., axios or fetch wrapper
  this.clients['my-ai-provider'] = new MyAIClient(apiKey, endpoint);
}
```

---

## 3. Add Model Support (if needed)

- If the provider supports multiple models, allow model selection via environment variable (e.g., `MY_AI_MODEL`).
- Update the client logic to use the selected model in requests.

**Example:**
```ts
const model = this.config.get<string>('MY_AI_MODEL') || 'default-model';
// Use model in API requests
```

---

## 4. Update Configuration Management

**File:** `src/modules/ai/ConfigurationManager.ts`

- Add logic to load and validate the new provider's environment variables.
- Optionally, add a method to retrieve the provider's config.

---

## 5. Add to Provider Selection Menu

**File:** `src/cli.ts` (and/or `InteractiveProviderMenu`)

- Add the new provider to the interactive selection menu and CLI status output.
- Ensure the provider's status and configuration are displayed to the user.

---

## 6. Update `.env.example`

- Add example environment variables for the new provider:
```
MY_AI_API_KEY=your-api-key-here
MY_AI_ENDPOINT=https://api.my-ai-provider.com/v1/
MY_AI_MODEL=your-model-name
```

---

## 7. Test the Integration

- Write or update test scripts in `src/test/` to validate the new provider.
- Use the CLI (`--select-provider`, `--status`, or custom test scripts) to verify configuration and connectivity.

---

## 8. Document the Provider

- Add a section to the main `README.md` and/or `docs/` describing the new provider, its features, and setup steps.

---

## 9. (Optional) Add Advanced Features

- Implement advanced features such as streaming, custom error handling, or model listing if supported by the provider.

---

## 10. Submit a Pull Request

- Ensure all code is linted and tested.
- Submit your changes for review.

---

## Example Checklist
- [ ] Provider defined in `provider-definitions.ts`
- [ ] Client logic added in `AIClientManager.ts`
- [ ] Model support implemented
- [ ] Configuration management updated
- [ ] Provider selection menu updated
- [ ] `.env.example` updated
- [ ] Tests written and passing
- [ ] Documentation updated

---

For more details, see the architecture and implementation guides in the `docs/` folder. 