# ADPA Enterprise Framework Automation

A modular, standards-compliant Node.js/TypeScript automation framework for enterprise requirements, project, and data management. Provides CLI and API for BABOK v3, PMBOK 7th Edition, and DMBOK 2.0 (in progress). Production-ready Express.js API with TypeSpec architecture. Designed for secure, scalable, and maintainable enterprise automation.

## Features
- CLI and API for document generation and validation
- Support for BABOK v3, PMBOK 7th Edition, DMBOK 2.0
- Multi-provider AI integration (Google, Azure, GitHub, Ollama)
- Confluence and SharePoint publishing
- Modular configuration via `config-rga.json` and `processor-config.json`
- TypeSpec/OpenAPI-based API

## Quick Start

### CLI Usage
```sh
npx adpa-enterprise-framework-automation --help
```

### Setup Wizard
```sh
npx adpa-enterprise-framework-automation --setup
```

### Analyze Workspace
```sh
npx adpa-enterprise-framework-automation --analyze
```

### Generate a Document
```sh
npx adpa-enterprise-framework-automation --generate <key>
```

### List Templates
```sh
npx adpa-enterprise-framework-automation --list-templates
```

## Configuration
- `.env`: AI provider credentials and environment variables
- `config-rga.json`: Main project and provider configuration
- `src/modules/documentGenerator/processor-config.json`: Advanced processor settings

## API Usage
- Start API server: `npm run api:start`
- OpenAPI spec: `api-specs/generated/openapi/adpa-api.yaml`

## Documentation
- See [docs/](docs/) for implementation guides, integration, and standards compliance.

## Requirements
- Node.js >= 18
- npm >= 9

## License
MIT
