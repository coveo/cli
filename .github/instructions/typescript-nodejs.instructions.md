---
applyTo: ['**/*.ts', '**/*.js', '**/*.mjs']
description: 'TypeScript and Node.js best practices for the Coveo CLI monorepo, including oclif CLI patterns, monorepo structure, and Windows PowerShell considerations.'
---

# TypeScript and Node.js Guidelines for Coveo CLI

## Project Structure

This is a **monorepo** managed with:

- **npm workspaces** for package management
- **nx** for build orchestration and dependency graph
- **oclif** framework for CLI commands

### Package Organization

The monorepo has three main categories:

1. **CLI Packages** (`packages/cli/`)
   - `cli-commons-dev`: Development utilities (eslint config, test helpers) - **foundation layer**
   - `cli-commons`: Production utilities (error handling, config, platform client) - **shared layer**
   - `core`: The main CLI application - **application layer**
   - `source`: Source-specific commands

2. **UI Packages** (`packages/ui/`)
   - Headless implementations (React, Vue, Angular)
   - Atomic components
   - Project scaffolding templates

3. **E2E Tests** (`packages/cli-e2e/`)
   - End-to-end integration tests

### Dependency Rules

- `core` depends on `commons` and `commons-dev`
- `commons` depends on `commons-dev`
- `commons-dev` has no internal dependencies
- Always use local package imports from `@coveo/cli-commons/*` and `@coveo/cli-commons-dev/*`

## TypeScript Configuration

### Three Config Files Pattern

Each CLI package uses up to 3 TypeScript configs:

1. **`tsconfig.json`**: Base configuration for IDE language servers
2. **`tsconfig.dev.json`**: Dev mode for running commands with oclif (requires `@oclif/core` patch)
3. **`tsconfig.build.json`**: Production transpilation with project references

### Path Mappings

```typescript
// Example from tsconfig.json
"paths": {
  "@coveo/cli-commons/*": ["../commons/src/*"],
  "@coveo/cli-commons-dev/*": ["../commons-dev/src/*"]
}
```

## oclif CLI Framework Patterns

### Command Structure

All CLI commands extend from `CLICommand` (from `@coveo/cli-commons/command/cliCommand`):

```typescript
import {CLICommand} from '@coveo/cli-commons/command/cliCommand';
import {Flags} from '@oclif/core';
import dedent from 'ts-dedent';

export default class MyCommand extends CLICommand {
  public static description = dedent`
    Multi-line description
    using ts-dedent for proper formatting.
  `;

  public static examples = ['$ coveo my:command'];

  public static flags = {
    myFlag: Flags.string({
      char: 'f',
      description: 'Flag description',
      helpValue: 'exampleValue',
    }),
  };

  public async run() {
    // Command implementation
  }
}
```

### Decorators

Use `@Trackable` decorator for analytics:

```typescript
import {Trackable} from '@coveo/cli-commons/preconditions/trackable';

@Trackable({eventName: 'my command'})
public async run() {
  // Implementation
}
```

### Flags Pattern

Common flag patterns are exported from `lib/flags/`:

- `withRegion()` - Platform region selection
- `withEnvironment()` - Environment selection (prod, dev, etc.)

```typescript
public static flags = {
  ...withRegion(),
  ...withEnvironment(),
  // ... your custom flags
};
```

## Windows and PowerShell Support

### Important: Cross-Platform Compatibility

The CLI runs on Windows, macOS, and Linux. On **Windows**, the CLI uses **PowerShell** as the shell for spawning processes.

### Key Patterns

1. **Append `.ps1` extension on Windows**:

```typescript
import {appendCmdIfWindows} from '@coveo/cli-commons/utils/os';

spawnSync(appendCmdIfWindows`npm`, ['install'], {
  shell: process.platform === 'win32' ? 'powershell' : undefined,
});
```

2. **Check platform before using shell-specific features**:

```typescript
const shell = process.platform === 'win32' ? 'powershell' : undefined;
```

3. **Path handling**: Always use `node:path` module's `join()` and `resolve()` for cross-platform paths

### PowerShell Considerations

When writing code that spawns processes on Windows:

- **Commands** need `.ps1` or `.cmd` extension on Windows
- **Shell option** should be set to `'powershell'` on Windows
- **Escape sequences** differ - test on Windows when using special characters
- **Environment variables** syntax differs (`$env:VAR` in PowerShell vs `$VAR` in bash)

## Code Style and Conventions

### Imports

1. **Order**: Node built-ins, external packages, internal packages, relative imports

```typescript
// Node built-ins
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

2. **Use node: protocol**: For Node.js built-in modules, use `node:` prefix

```typescript
import {fork} from 'node:child_process';
import {resolve} from 'node:path';
```

### Error Handling

Use custom error classes from `@coveo/cli-commons/errors/`:

```typescript
import {InternalError} from '@coveo/cli-commons/errors/internalError';

throw new InternalError(`Descriptive error message`);
```

### Async/Await

- Prefer `async/await` over `.then()` chains
- Always handle errors with try-catch or let them bubble up
- Use `Promise.all()` for parallel operations when possible

## Testing Patterns

### File Location

Tests are co-located with implementation files:

```
src/commands/auth/login.ts
src/commands/auth/login.spec.ts
```

### Jest and @oclif/test

```typescript
import {test} from '@oclif/test';

describe('my:command', () => {
  // Test setup
  beforeEach(() => {
    // Mock setup
  });

  test
    .stdout()
    .command(['my:command', '--flag', 'value'])
    .it('should do something', (ctx) => {
      expect(ctx.stdout).toContain('expected output');
    });
});
```

### Mocking Pattern

Use `jest.mock()` at the top of test files:

```typescript
jest.mock('../../lib/oauth/oauth');
jest.mock('@coveo/cli-commons/config/config');

const mockedOAuth = jest.mocked(OAuth);
const mockedConfig = jest.mocked(Config);

// In test:
mockedConfig.mockImplementation(() => ({
  /* mock */
}));
```

## Package.json Exports

`cli-commons` and `cli-commons-dev` use the `exports` field for cleaner imports:

```json
{
  "exports": {
    "./config/*": "./src/config/*.js",
    "./errors/*": "./src/errors/*.js"
  }
}
```

This keeps imports simple: `@coveo/cli-commons/config/config` instead of long relative paths.

## Common Utilities

### Configuration Management

```typescript
import {Config} from '@coveo/cli-commons/config/config';

const config = new Config(this.config.configDir);
config.set({organization: 'myOrg'});
const cfg = config.get();
```

### Platform Client

```typescript
import {AuthenticatedClient} from '@coveo/cli-commons/platform/authenticatedClient';

const client = new AuthenticatedClient();
const orgs = await client.getAllOrgsUserHasAccessTo();
```

### User Feedback

```typescript
// Logging
this.log('Info message');
this.warn('Warning message');
this.error('Error message'); // Exits with code 1

// Formatting
import {formatOrgId} from '@coveo/cli-commons/utils/ux';
this.log(`Organization: ${formatOrgId(cfg.organization)}`);
```

## Development Workflow

### Running in Dev Mode

```bash
# From repo root
./packages/cli/core/bin/dev my:command --flag value
```

### Building

```bash
npm run build  # Builds all packages
```

### Running Tests

```bash
npm run test  # Runs all tests
```

### Linting

```bash
npm run lint
```

## Key Points for AI Assistants

1. **Respect the dependency hierarchy**: commons-dev → commons → core
2. **Use oclif patterns**: Extend CLICommand, use Flags, add static description/examples
3. **Cross-platform awareness**: Always consider Windows/PowerShell when spawning processes
4. **Test co-location**: Tests go next to implementation files with `.spec.ts` extension
5. **Import discipline**: Use proper paths with `@coveo/cli-commons/*` and `node:` protocol
6. **TypeScript strict mode**: Code should pass strict type checking
7. **Monorepo awareness**: Changes may affect multiple packages - check dependency graph
