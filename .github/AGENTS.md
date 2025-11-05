# AGENTS.md - Context for AI Coding Agents

> **Note**: This file is specifically designed for AI coding agents. For human-readable project information, see [README.md](../README.md) and [CONTRIBUTING.md](CONTRIBUTING.md).

## Purpose

This document provides detailed technical context that AI agents need to effectively work with the Coveo CLI codebase. It complements the README with precise, agent-focused guidance about architecture, testing, and development conventions.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Development Setup](#development-setup)
5. [Testing](#testing)
6. [Code Conventions](#code-conventions)
7. [Monorepo Management](#monorepo-management)
8. [Common Patterns](#common-patterns)
9. [Troubleshooting](#troubleshooting)

---

## Project Overview

**Coveo CLI** is a command-line interface for interacting with the Coveo platform. It provides:
- Project scaffolding for Coveo Headless and Atomic implementations
- Organization and resource management
- Source management for Coveo Push API
- Query execution and debugging tools

**Target Users**: Developers building search experiences with Coveo, DevOps engineers automating deployments.

**Repository Type**: Monorepo with multiple interconnected packages.

---

## Architecture

### High-Level Structure

```
Coveo CLI Monorepo
│
├── CLI Layer
│   ├── cli-commons-dev     (Foundation: Dev tools, test helpers)
│   ├── cli-commons         (Core: Config, platform client, utilities)
│   ├── core               (Application: CLI commands, business logic)
│   └── source             (Feature: Source-specific commands)
│
├── UI Layer
│   ├── Scaffolding templates (React, Vue, Angular)
│   └── Component libraries (Atomic, Headless)
│
└── Infrastructure
    ├── E2E tests (cli-e2e)
    └── Build utilities (utils/)
```

### Dependency Hierarchy

**Critical Rule**: Packages must respect this dependency order:

```
cli-commons-dev (no internal deps)
      ↓
cli-commons (depends on commons-dev)
      ↓
core (depends on commons, commons-dev)
```

**Never create circular dependencies or reverse dependencies.**

### Package Purposes

- **cli-commons-dev**: Shared development tooling (ESLint configs, test utilities, build helpers)
- **cli-commons**: Shared production code (config management, platform API client, error classes, utilities)
- **core**: Main CLI application (commands, CLI-specific logic, user interactions)
- **source**: Commands for managing Coveo Push API sources
- **ui/***: Project templates and scaffolding for UI frameworks

---

## Technology Stack

### Core Technologies

| Technology | Purpose | Version |
|------------|---------|---------|
| **TypeScript** | Primary language | 4.9.5 |
| **Node.js** | Runtime | ≥18 |
| **npm** | Package manager | ≥8.5.4 |
| **oclif** | CLI framework | 3.x |
| **Jest** | Testing framework | Latest |
| **nx** | Monorepo orchestration | Latest |

### Key Libraries

- **@oclif/core**: CLI framework providing command structure, flags, plugins
- **@coveo/platform-client**: Official Coveo platform API client
- **ts-dedent**: Multi-line string formatting for descriptions
- **yargs**: Command-line parsing (in some utilities)

### Development Tools

- **ESLint**: Code linting with custom configurations
- **Prettier**: Code formatting
- **Husky**: Git hooks for pre-commit checks
- **lint-staged**: Run linters on staged files
- **commitlint**: Enforce conventional commits

---

## Development Setup

### Initial Setup

```bash
# Clone and install
git clone https://github.com/coveo/cli.git
cd cli
npm install  # Installs all workspace dependencies and links local packages
```

### Running the CLI Locally

**Dev mode** (with hot TypeScript compilation):

```bash
./packages/cli/core/bin/dev [command] [flags]

# Examples:
./packages/cli/core/bin/dev --version
./packages/cli/core/bin/dev auth:login
./packages/cli/core/bin/dev ui:create:react myapp
```

**Production build**:

```bash
npm run build
node packages/cli/core/bin/run [command]
```

### Key Commands

```bash
# Build all packages (respects dependency order)
npm run build

# Run all tests
npm run test

# Lint and format check
npm run lint

# Run specific workspace tests
npm run test --workspace=@coveo/cli

# Clean builds
rm -rf packages/*/lib && npm run build
```

### Development Workflow

1. **Make changes** in appropriate package (usually `packages/cli/core/src`)
2. **Test in dev mode**: `./packages/cli/core/bin/dev your:command`
3. **Write/update tests**: Co-locate `.spec.ts` files with implementation
4. **Run tests**: `npm run test`
5. **Build**: `npm run build` (or just the affected package)
6. **Lint**: `npm run lint`
7. **Commit**: Use conventional commit format

---

## Testing

### Test Organization

**Co-location**: Tests live next to implementation files:

```
src/commands/auth/login.ts
src/commands/auth/login.spec.ts
```

**Naming**: Use `.spec.ts` extension (not `.test.ts`).

### Testing Frameworks

- **Jest**: Core testing framework
- **@oclif/test**: CLI-specific testing utilities

### Writing Tests

**Basic structure**:

```typescript
import {test} from '@oclif/test';

describe('my:command', () => {
  // Setup
  beforeEach(() => {
    // Reset mocks
  });

  // Tests
  test
    .stdout()
    .command(['my:command', '--flag', 'value'])
    .it('should do something', (ctx) => {
      expect(ctx.stdout).toContain('expected output');
    });
});
```

**Mocking pattern**:

```typescript
// At file top, before imports
jest.mock('../../lib/oauth/oauth');
jest.mock('@coveo/cli-commons/config/config');

// Import and get typed mocks
import {OAuth} from '../../lib/oauth/oauth';
const mockedOAuth = jest.mocked(OAuth);

// In test
mockedOAuth.mockImplementation(() => ({ /* mock */ }));
```

### Running Tests

```bash
# All tests
npm run test

# Watch mode
npm run test -- --watch

# Specific package
npm run test --workspace=@coveo/cli

# With coverage
npm run test -- --coverage

# Update snapshots
npm run test -- -u
```

### Test Best Practices

1. **Mock external dependencies**: Config, platform client, OAuth, file system
2. **Reset mocks**: Use `beforeEach(() => jest.clearAllMocks())`
3. **Test behavior, not implementation**: Focus on outputs and effects
4. **Test error cases**: Don't just test happy paths
5. **Use descriptive names**: Clear behavior-focused descriptions
6. **Keep tests fast**: No real network calls or file I/O

---

## Code Conventions

### Import Organization

**Order**: Node built-ins → External packages → Internal packages → Relative imports

```typescript
// Node built-ins (with node: prefix)
import {join} from 'node:path';
import {existsSync} from 'node:fs';

// External packages
import {Flags} from '@oclif/core';
import dedent from 'ts-dedent';

// Internal packages
import {CLICommand} from '@coveo/cli-commons/command/cliCommand';
import {Config} from '@coveo/cli-commons/config/config';

// Relative imports
import {OAuth} from '../../lib/oauth/oauth';
```

### Command Structure

All CLI commands extend `CLICommand`:

```typescript
import {CLICommand} from '@coveo/cli-commons/command/cliCommand';
import {Flags} from '@oclif/core';
import dedent from 'ts-dedent';

export default class MyCommand extends CLICommand {
  public static description = dedent`
    Clear, concise description.
    Can be multi-line using ts-dedent.
  `;

  public static examples = [
    '$ coveo my:command',
    '$ coveo my:command --flag value',
  ];

  public static flags = {
    myFlag: Flags.string({
      char: 'f',
      description: 'Flag description',
      helpValue: 'exampleValue',
    }),
  };

  public async run() {
    const {flags} = await this.parse(MyCommand);
    // Implementation
  }
}
```

### TypeScript Patterns

**Async/await over promises**:
```typescript
// Good
const result = await someAsyncOperation();

// Avoid
someAsyncOperation().then(result => { /* ... */ });
```

**Strict typing**:
```typescript
// Good - explicit types
const config: Config = new Config(this.config.configDir);

// Avoid - implicit any
const config = getSomeConfig();
```

**Error handling**:
```typescript
import {InternalError} from '@coveo/cli-commons/errors/internalError';

if (!isValid(input)) {
  throw new InternalError('Descriptive error message');
}
```

### Cross-Platform Considerations

**Windows uses PowerShell** for spawned processes:

```typescript
import {appendCmdIfWindows} from '@coveo/cli-commons/utils/os';

spawnSync(appendCmdIfWindows`npm`, ['install'], {
  shell: process.platform === 'win32' ? 'powershell' : undefined,
});
```

**Path handling**:
```typescript
// Always use node:path module
import {join, resolve} from 'node:path';

const fullPath = join(baseDir, 'subdir', 'file.txt');
```

### Code Style

- **Formatting**: Handled by Prettier (runs on pre-commit)
- **Linting**: ESLint with custom rules (check with `npm run lint`)
- **Line length**: Prefer ≤80 characters, max 120
- **Naming**:
  - Classes: PascalCase (`MyCommand`)
  - Functions/methods: camelCase (`runCommand()`)
  - Constants: UPPER_SNAKE_CASE (`DEFAULT_TIMEOUT`)
  - Files: kebab-case (`my-command.ts`)

---

## Monorepo Management

### Workspace Structure

Uses **npm workspaces** for package management:

```json
{
  "workspaces": [
    "packages/*",
    "packages/ui/*",
    "packages/cli/*",
    "utils/*"
  ]
}
```

### Build Orchestration

**nx** manages build order and caching:

```bash
# Build respects dependency graph automatically
npm run build

# Rebuild specific package and dependents
nx run @coveo/cli:build

# Clear cache if needed
nx reset
```

### Adding Dependencies

```bash
# Add external dependency to specific package
npm install some-package --workspace=@coveo/cli

# Add internal dependency (in package.json)
{
  "dependencies": {
    "@coveo/cli-commons": "workspace:*"
  }
}
```

### TypeScript Project References

Packages use **project references** for incremental builds:

```json
// tsconfig.build.json
{
  "extends": "./tsconfig.json",
  "references": [
    {"path": "../commons-dev"},
    {"path": "../commons"}
  ]
}
```

This enables:
- Incremental compilation
- Proper build order
- Type checking across packages

---

## Common Patterns

### Configuration Management

```typescript
import {Config} from '@coveo/cli-commons/config/config';

const config = new Config(this.config.configDir);

// Get configuration
const cfg = config.get();
console.log(cfg.organization);

// Set configuration
config.set({
  organization: 'myOrg',
  region: 'us',
});
```

### Platform API Client

```typescript
import {AuthenticatedClient} from '@coveo/cli-commons/platform/authenticatedClient';

const client = new AuthenticatedClient();

// List organizations
const orgs = await client.getAllOrgsUserHasAccessTo();

// Check access
const hasAccess = await client.getUserHasAccessToOrg('myOrg');
```

### User Feedback

```typescript
// Info logging
this.log('Operation completed successfully');

// Warnings
this.warn('This feature is deprecated');

// Errors (exits with code 1)
this.error('Operation failed: invalid input');

// Formatting utilities
import {formatOrgId} from '@coveo/cli-commons/utils/ux';
this.log(`Organization: ${formatOrgId(orgId)}`);
```

### Flag Patterns

Common flags are exported from `lib/flags/`:

```typescript
import {withRegion, withEnvironment} from '../../lib/flags/platformCommonFlags';

export default class MyCommand extends CLICommand {
  public static flags = {
    ...withRegion(),
    ...withEnvironment(),
    customFlag: Flags.string({
      description: 'Custom flag',
    }),
  };
}
```

### Decorators

**Trackable** decorator for analytics:

```typescript
import {Trackable} from '@coveo/cli-commons/preconditions/trackable';

@Trackable({eventName: 'command executed'})
public async run() {
  // Command implementation
}
```

---

## Troubleshooting

### Build Issues

**Stale TypeScript compilation**:
```bash
rm -rf packages/*/lib
npm run build
```

**nx cache issues**:
```bash
nx reset
npm run build
```

### Dependency Issues

**Broken workspace links**:
```bash
rm -rf node_modules package-lock.json
rm -rf packages/*/node_modules
npm install
```

**Outdated dependencies**:
```bash
npm update --workspace=@coveo/cli
```

### Test Issues

**Stale mocks**:
- Ensure `jest.clearAllMocks()` in `beforeEach`
- Check mock setup order

**Tests passing locally but failing in CI**:
- Check for race conditions in async tests
- Verify no reliance on local state or file system
- Ensure mocks are properly isolated

### TypeScript Errors

**Cannot find module '@coveo/cli-commons/*'**:
- Build the dependency first: `npm run build --workspace=@coveo/cli-commons`
- Check `tsconfig.json` path mappings

**Module resolution issues**:
- Clear and rebuild: `rm -rf packages/*/lib && npm run build`
- Check TypeScript project references in `tsconfig.build.json`

### Dev Mode Issues

**Command not found in dev mode**:
```bash
# Make sure you're running from repo root
./packages/cli/core/bin/dev --help
```

**Changes not reflected**:
- Dev mode uses ts-node, should hot-compile
- If issues persist, try full rebuild: `npm run build`

---

## Quick Reference

### File Locations

| Purpose | Location |
|---------|----------|
| CLI commands | `packages/cli/core/src/commands/` |
| Shared utilities | `packages/cli/commons/src/` |
| Test helpers | `packages/cli/commons-dev/src/testUtils/` |
| E2E tests | `packages/cli-e2e/` |
| Build scripts | `scripts/` |
| Configuration | Root `package.json`, `nx.json`, `tsconfig.base.json` |

### Common Tasks

| Task | Command |
|------|---------|
| Run CLI locally | `./packages/cli/core/bin/dev [command]` |
| Build all | `npm run build` |
| Test all | `npm run test` |
| Lint | `npm run lint` |
| Format | `npm run pre-commit` (runs lint-staged) |
| Clean | `rm -rf packages/*/lib && npm run build` |

### Key Concepts

- **Monorepo**: Multiple packages in one repository
- **Workspaces**: npm's built-in monorepo support
- **nx**: Build orchestration and caching
- **oclif**: CLI framework for commands and plugins
- **Project References**: TypeScript's incremental build system
- **Co-location**: Tests next to implementation files

---

## Additional Resources

- **README.md**: User-facing documentation and quick start
- **CONTRIBUTING.md**: Contribution guidelines and project structure
- **Instruction files**: `.github/instructions/*.instructions.md` for specific guidance
- **oclif documentation**: https://oclif.io/
- **Coveo Platform API**: https://docs.coveo.com/en/151/
- **Monorepo tools**: https://monorepo.tools/

---

**Last Updated**: 2025-11-05  
**Maintained for**: AI Coding Agents  
**Questions**: See CONTRIBUTING.md or open an issue
