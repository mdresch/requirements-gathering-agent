# Monorepo & CI/CD Setup Checklist


## Monorepo Structure
- [x] Create a root directory for the monorepo (e.g., `requirements-gathering-agent/`)
- [x] Organize subdirectories for:
  - [x] CLI
  - [x] REST API (Express.js)
  - [x] Admin web portal (Next.js/React)
  - [x] Shared libraries/utilities
  - [x] Documentation and templates
- [x] Add a root `package.json` with workspaces or equivalent monorepo tool (e.g., Yarn, npm, pnpm)
- [x] Configure TypeScript project references and `tsconfig.json` for all packages
- [ ] Add linting, formatting, and commit hooks (e.g., ESLint, Prettier, Husky)

## CI/CD Pipeline
- [x] Choose a CI/CD platform (e.g., GitHub Actions, Azure Pipelines, GitLab CI)
- [x] Set up workflows for:
  - [x] Install dependencies and cache node_modules
  - [x] Lint and format code
  - [x] Run unit and integration tests
  - [x] Build all packages/apps
-  - [x] Deploy to staging/production (if applicable)
- [x] Configure environment variables and secrets for CI/CD
- [x] Add status badges to the README
