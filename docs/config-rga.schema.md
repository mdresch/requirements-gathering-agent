# Requirements Gathering Agent Configuration Reference

This document explains the settings available in `config-rga.json` for user preferences and provider selection.

| Setting                | Description                                                                                  | Recommended Value         |
|------------------------|----------------------------------------------------------------------------------------------|--------------------------|
| `AI_TIMEOUT`           | Timeout for AI requests in ms. Too small = errors, too large = slow feedback.                | 10000–60000              |
| `EXPERIMENTAL_FEATURES`| Enables new, possibly unstable features. True = early access, False = stable only.            | true/false               |
| `showMetrics`          | Show performance metrics (timing, token usage) in CLI output.                                 | true/false               |
| `currentProvider`      | The preferred/active AI provider for document generation.                                     | github-ai, google-ai, etc|
| `defaultOutputDir`     | Default directory for generated documents.                                                    | generated-documents      |
| `preferredFormat`      | Default output format for generated documents (markdown, json, yaml, etc.).                   | markdown                 |
| `providers`            | Per-provider non-secret preferences (e.g., preferred model).                                 | See example below        |

## Example `config-rga.json`

```
{
  "currentProvider": "github-ai",
  "defaultOutputDir": "generated-documents",
  "preferredFormat": "markdown",
  "showMetrics": true,
  "AI_TIMEOUT": 60000,
  "EXPERIMENTAL_FEATURES": true,
  "providers": {
    "github-ai": { "model": "gpt-4o-mini" },
    "google-ai": { "model": "gemini-1.5-flash" },
    "ollama": { "model": "llama3.1" }
  }
}
```

> **Note:**
> - All secrets (API keys, tokens) should remain in `.env` and not be committed to version control.
> - This file is safe to share and sync with your team.
> - You can add more preferences as needed.
