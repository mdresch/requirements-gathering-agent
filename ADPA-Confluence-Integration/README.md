# ADPA Confluence Integration

This is an Atlassian Forge app that integrates the ADPA (Requirements Gathering Agent) with Confluence for document publishing.

## Features

- **Document Generator Macro**: Generate PMBOK-compliant project documentation directly in Confluence pages
- **Admin Interface**: Configure AI providers, default settings, and manage document templates
- **Multi-AI Provider Support**: Works with Azure OpenAI, Google AI, GitHub AI, and Ollama
- **PMBOK Compliance**: Follows PMBOK 6 and 7 standards for project management documentation

## Quick Start

### Prerequisites

- Node.js 18 or higher
- Atlassian Forge CLI installed globally (`npm install -g @forge/cli`)
- Access to a Confluence Cloud instance

### Installation

1. **Clone and Setup**
   ```bash
   cd ADPA-Confluence-Integration
   npm install
   ```

2. **Build Static Assets**
   ```bash
   npm run build
   ```

3. **Deploy the App**
   ```bash
   forge deploy
   ```

4. **Install in Confluence**
   ```bash
   forge install
   ```

## Quick start
- Install top-level dependencies:
```
npm install
```

- Install dependencies inside of the `static/hello-world` directory:
```
npm install
```

- Modify your app frontend by editing the files in `static/hello-world/src/`.

- Build your app (inside of the `static/hello-world` directory):
```
npm run build
```

- Install dependencies inside of the `static/config` directory:
```
npm install
```

- Modify your app's configuration frontend by editing the files in `static/config/src/`.

- Build your app (inside of the `static/config` directory):
```
npm run build
```

- Modify your app backend by editing the `src/resolvers/index.js` file to define resolver functions. See [Forge resolvers](https://developer.atlassian.com/platform/forge/runtime-reference/custom-ui-resolver/) for documentation on resolver functions.

- Deploy your app by running:
```
forge deploy
```

- Install your app in an Atlassian site by running:
```
forge install
```

### Notes
- Use the `forge deploy` command when you want to persist code changes.
- Use the `forge install` command when you want to install the app on a new site.
- Once the app is installed on a site, the site picks up the new app changes you deploy without needing to rerun the install command.

## Support

See [Get help](https://developer.atlassian.com/platform/forge/get-help/) for how to get help and provide feedback.
