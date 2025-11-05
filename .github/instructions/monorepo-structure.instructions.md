---
applyTo: ['**/package.json', '**/tsconfig*.json', 'nx.json']
description: 'Monorepo structure, workspace management, and dependency topology for the Coveo CLI.'
---

# Monorepo Structure and Workspace Management

## Overview

The Coveo CLI is a **monorepo** containing multiple related packages managed as a single repository. This approach allows:

- Shared tooling and configuration
- Coordinated versioning across packages
- Easier cross-package refactoring
- Consistent development workflow

## Tooling Stack

### npm Workspaces

Package management uses **npm workspaces** (defined in root `package.json`):

```json
{
  "workspaces": [
    "packages/*",
    "packages/ui/*",
    "packages/ui/atomic/*",
    "packages/ui/vue/create-headless-vue",
    "packages/ui/vue/create-headless-vue/template",
    "packages/cli/*",
    "utils/*"
  ]
}
```

### nx (Nrwl Extensions)

**nx** orchestrates builds and understands the dependency graph:

```bash
# Build all packages
npm run build  # Runs: nx run-many --target=build --all

# Test all packages
npm run test   # Runs: nx run-many --target=test --all

# Lint all packages
npm run lint   # Runs: nx run-many --target=lint --all
```

**nx** automatically:

- Determines build order based on dependencies
- Caches build outputs
- Runs tasks in parallel when possible
- Generates dependency topology graph

## Directory Structure

```
coveo/cli/
├── packages/
│   ├── cli/
│   │   ├── commons-dev/     ← Foundation: Dev utilities
│   │   ├── commons/         ← Shared: Production utilities
│   │   ├── core/           ← Application: Main CLI
│   │   └── source/         ← Feature: Source commands
│   ├── cli-e2e/            ← E2E tests
│   └── ui/
│       ├── atomic/         ← Atomic components
│       ├── react/          ← React scaffolding
│       ├── vue/            ← Vue scaffolding
│       └── angular/        ← Angular scaffolding
├── utils/                  ← Build and release utilities
│   ├── puppeteer-helpers/
│   ├── verdaccio-starter/
│   ├── do-npm/
│   └── process-helpers/
├── scripts/                ← Automation scripts
├── rfcs/                   ← Request for Comments docs
└── terraform/              ← Infrastructure as Code
```

## Package Categories

### CLI Packages (`packages/cli/`)

These form a **dependency hierarchy**:

```
cli-commons-dev (no deps)
    ↓
cli-commons (depends on commons-dev)
    ↓
core (depends on commons and commons-dev)
```

**Key Rule**: Dependencies must respect this hierarchy. Never create circular dependencies.

### UI Packages (`packages/ui/`)

Framework-specific templates and components:

- Create search page scaffolding
- Provide example implementations
- Support Headless and Atomic libraries

### Utility Packages (`utils/`)

Build-time and development utilities:

- Not published to npm
- Support development and release processes
- Shared across the monorepo

## Dependency Management

### Internal Dependencies

Use workspace protocol for local packages:

```json
{
  "dependencies": {
    "@coveo/cli-commons": "workspace:*",
    "@coveo/cli-commons-dev": "workspace:*"
  }
}
```

During development, npm automatically links these. For publishing, they're resolved to actual versions.

### External Dependencies

Install from project root to benefit from hoisting:

```bash
# Install for all workspaces
npm install some-package --workspace=@coveo/cli

# Install dev dependency
npm install --save-dev some-tool --workspace=@coveo/cli-commons
```

### Dependency Topology

nx generates a topology graph (`topology.json`) used by the release system:

```bash
npm run nx:graph  # Generates topology.json
```

This graph determines:

- Build order (topological sort)
- Which packages need rebuilding when dependencies change
- Release order during publishing

## Package.json Structure

### Root package.json

Contains:

- Workspace definitions
- Shared dev dependencies
- Monorepo-wide scripts
- Lint-staged configuration
- Commitlint configuration

### Package-level package.json

Each package has:

```json
{
  "name": "@coveo/cli-commons",
  "version": "3.2.13",
  "main": "./lib/index.js",
  "types": "./lib/index.d.ts",
  "exports": {
    "./config/*": "./lib/config/*.js",
    "./errors/*": "./lib/errors/*.js",
    "./platform/*": "./lib/platform/*.js",
    "./utils/*": "./lib/utils/*.js"
  },
  "files": ["lib", "oclif.manifest.json"],
  "scripts": {
    "build": "tsc -b tsconfig.build.json",
    "test": "jest",
    "lint": "eslint src"
  }
}
```

**Key fields**:

- `exports`: Defines public API surface
- `files`: What gets published to npm
- `scripts`: Package-specific tasks that nx runs

## TypeScript Project References

### Configuration Hierarchy

Uses **TypeScript Project References** for incremental builds:

```json
// tsconfig.build.json
{
  "extends": "./tsconfig.json",
  "references": [{"path": "../commons-dev"}, {"path": "../commons"}]
}
```

This tells TypeScript:

- Build dependencies first
- Use compiled outputs from dependencies
- Enable incremental compilation

### Path Mappings

Development uses path mappings for imports:

```json
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@coveo/cli-commons/*": ["../commons/src/*"],
      "@coveo/cli-commons-dev/*": ["../commons-dev/src/*"]
    }
  }
}
```

This allows imports like:

```typescript
import {Config} from '@coveo/cli-commons/config/config';
```

### Three Config Pattern

Each CLI package typically has:

1. **tsconfig.json**: Base config for IDE
2. **tsconfig.dev.json**: Dev mode with ts-node
3. **tsconfig.build.json**: Production compilation

## Scripts and Commands

### Monorepo-wide Commands

```bash
# Install all dependencies
npm install

# Build everything
npm run build

# Test everything
npm run test

# Lint everything
npm run lint

# Clean and reinstall
npm run clean && npm install
```

### Package-specific Commands

```bash
# Run command in specific workspace
npm run test --workspace=@coveo/cli

# Run CLI in dev mode
./packages/cli/core/bin/dev [command]
```

### nx Commands

```bash
# Run target for all packages
nx run-many --target=build --all

# Run target for specific package
nx run @coveo/cli:build

# Show dependency graph
nx graph

# Clear nx cache
nx reset
```

## Version Management

### Version Strategy

- **After 1.35.12**: Packages have **independent versions**
- Each package can be versioned separately
- Versions are determined by conventional commits

### Version Synchronization

During release:

1. Determine which packages changed
2. Calculate new version for each (based on commits)
3. Update internal dependency versions
4. Publish in topological order

## Working with the Monorepo

### Adding a New Package

1. Create package directory: `packages/cli/my-new-package/`
2. Add `package.json` with workspace dependencies
3. Add to workspace list in root `package.json` if needed (usually auto-detected)
4. Run `npm install` to link
5. Add TypeScript configs following the three-config pattern

### Adding Dependencies

```bash
# External dependency to specific package
npm install some-lib --workspace=@coveo/cli

# Internal dependency (use workspace protocol)
# Edit package.json:
{
  "dependencies": {
    "@coveo/cli-commons": "workspace:*"
  }
}
# Then: npm install
```

### Removing Dependencies

```bash
npm uninstall some-lib --workspace=@coveo/cli
```

### Dependency Updates

Use renovate (configured in `renovate.json`) for automated updates.

## Build Process

### Build Order

nx determines build order automatically:

1. **Phase 1**: commons-dev (no dependencies)
2. **Phase 2**: commons (depends on commons-dev)
3. **Phase 3**: core, source, ui packages (depend on commons)

### Incremental Builds

TypeScript project references enable incremental compilation:

- Only changed packages rebuild
- Dependencies' compiled outputs are reused
- Significantly faster than full rebuilds

### Build Outputs

Each package outputs to its `lib/` directory:

```
packages/cli/core/
├── src/          ← Source TypeScript
├── lib/          ← Compiled JavaScript (gitignored)
├── tsconfig.json
└── tsconfig.build.json
```

## Testing in Monorepo

### Test Organization

- Unit tests: Co-located with source (`.spec.ts`)
- E2E tests: In `packages/cli-e2e/`

### Running Tests

```bash
# All tests
npm run test

# Specific package
npm run test --workspace=@coveo/cli

# Watch mode
npm run test -- --watch

# With coverage
npm run test -- --coverage
```

## Common Workflows

### Developing CLI Feature

```bash
# 1. Make changes in packages/cli/core/src
# 2. Test in dev mode
./packages/cli/core/bin/dev my:command

# 3. Run tests
npm run test --workspace=@coveo/cli

# 4. Build
npm run build

# 5. Lint
npm run lint
```

### Updating Shared Utility

```bash
# 1. Make changes in packages/cli/commons/src
# 2. Build commons
npm run build --workspace=@coveo/cli-commons

# 3. Test dependent packages
npm run test --workspace=@coveo/cli

# 4. Build all (to ensure nothing breaks)
npm run build
```

## Troubleshooting

### Stale Builds

```bash
# Clear nx cache
nx reset

# Clean and rebuild
rm -rf packages/*/lib
npm run build
```

### Dependency Issues

```bash
# Fresh install
rm -rf node_modules package-lock.json
rm -rf packages/*/node_modules
npm install
```

### TypeScript Errors

```bash
# Rebuild project references
npm run build
```

## Key Points for AI Assistants

1. **Respect dependency hierarchy**: commons-dev → commons → core
2. **Use workspace protocol**: For internal dependencies
3. **Build order matters**: Use nx or build dependencies first
4. **Three TypeScript configs**: Base, dev, and build configs
5. **Path mappings**: Import using `@coveo/cli-commons/*` paths
6. **Run from root**: Most commands should run from repo root
7. **Test locally**: Use `./packages/cli/core/bin/dev` for testing
8. **Independent versions**: Packages version independently after 1.35.12
