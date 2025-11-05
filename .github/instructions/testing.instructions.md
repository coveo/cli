---
applyTo: ['**/*.spec.ts', '**/*.test.ts']
description: "Testing patterns, conventions, and best practices for the Coveo CLI monorepo."
---

# Testing Guidelines for Coveo CLI

## Test Organization

### File Naming and Location

Tests are **co-located** with the code they test:

```
packages/cli/core/src/
  commands/
    auth/
      login.ts          ← Implementation
      login.spec.ts     ← Test file
      token.ts
      token.spec.ts
```

**Convention**: Use `.spec.ts` extension for test files (not `.test.ts`).

### Test Structure

Use **describe** blocks to organize tests:

```typescript
describe('CommandOrFeatureName', () => {
  describe('specificMethod', () => {
    it('should do something specific', () => {
      // Test implementation
    });

    it('should handle edge case', () => {
      // Edge case test
    });
  });

  describe('anotherMethod', () => {
    it('should behave correctly', () => {
      // Test implementation
    });
  });
});
```

## Testing Framework

### Jest

The project uses **Jest** as the testing framework:

```typescript
import {test} from '@oclif/test';

// Standard Jest matchers
expect(value).toBe(expected);
expect(value).toEqual(expected);
expect(value).toContain(substring);
expect(value).toBeTruthy();
expect(mockFn).toHaveBeenCalledWith(arg1, arg2);
```

### @oclif/test

For CLI command testing, use `@oclif/test`:

```typescript
import {test} from '@oclif/test';

describe('my:command', () => {
  test
    .stdout()
    .command(['my:command', '--flag', 'value'])
    .it('should output expected result', (ctx) => {
      expect(ctx.stdout).toContain('expected text');
    });
});
```

## Mocking Patterns

### Module Mocking

Mock dependencies at the **top** of the test file:

```typescript
// At the top, before imports
jest.mock('../../lib/oauth/oauth');
jest.mock('@coveo/cli-commons/config/config');
jest.mock('@coveo/cli-commons/platform/authenticatedClient');

// Then import
import {OAuth} from '../../lib/oauth/oauth';
import {Config} from '@coveo/cli-commons/config/config';
import {AuthenticatedClient} from '@coveo/cli-commons/platform/authenticatedClient';

// Get typed mock references
const mockedOAuth = jest.mocked(OAuth);
const mockedConfig = jest.mocked(Config);
const mockedAuthenticatedClient = jest.mocked(AuthenticatedClient);
```

### Mock Implementation Pattern

```typescript
describe('auth:login', () => {
  const mockConfigSet = jest.fn();
  const mockConfigGet = jest.fn().mockReturnValue({
    region: 'us',
    organization: 'foo',
    environment: 'prod',
  });

  const mockListOrgs = jest
    .fn()
    .mockReturnValue(Promise.resolve([{id: 'foo'}]));

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup mock implementations
    mockedAuthenticatedClient.mockImplementation(
      () =>
        ({
          getAllOrgsUserHasAccessTo: mockListOrgs,
          getUserHasAccessToOrg: jest.fn().mockResolvedValue(true),
        } as unknown as AuthenticatedClient)
    );

    mockedConfig.mockImplementation(
      () =>
        ({
          get: mockConfigGet,
          set: mockConfigSet,
        } as unknown as Config)
    );
  });

  test
    .stdout()
    .command(['auth:login'])
    .it('should login successfully', (ctx) => {
      expect(ctx.stdout).toContain('Successfully logged in');
      expect(mockConfigSet).toHaveBeenCalled();
    });
});
```

## Test Lifecycle Hooks

### beforeEach and afterEach

Use lifecycle hooks to set up and tear down test state:

```typescript
describe('MyFeature', () => {
  let mockConfig: Config;
  let mockClient: AuthenticatedClient;

  beforeEach(() => {
    // Fresh setup before each test
    mockConfig = new Config('/tmp/test-config');
    mockClient = new AuthenticatedClient();
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Cleanup after each test
    jest.restoreAllMocks();
  });

  // Tests here...
});
```

### Setup and Teardown

- **beforeEach**: Reset mocks, create fresh instances
- **afterEach**: Restore original implementations, cleanup resources
- **beforeAll/afterAll**: Use sparingly for expensive setup (like test databases)

## Testing CLI Commands

### Command Testing Pattern

```typescript
import {test} from '@oclif/test';

describe('org:resources:pull', () => {
  test
    .stdout()
    .stderr()
    .command(['org:resources:pull', '--org', 'myOrg'])
    .it('should pull resources successfully', (ctx) => {
      expect(ctx.stdout).toContain('Resources pulled successfully');
      expect(ctx.stderr).toBe('');
    });

  test
    .stdout()
    .command(['org:resources:pull', '--invalid-flag'])
    .catch(/Unknown flag/)
    .it('should fail with invalid flag');
});
```

### Testing Command Flags

```typescript
describe('command flags', () => {
  test
    .stdout()
    .command(['my:command', '--region', 'eu'])
    .it('should accept region flag', (ctx) => {
      expect(ctx.stdout).toContain('eu');
    });

  test
    .stdout()
    .command(['my:command', '-r', 'us'])
    .it('should accept short flag', (ctx) => {
      expect(ctx.stdout).toContain('us');
    });
});
```

### Testing Command Output

```typescript
test
  .stdout()
  .command(['my:command'])
  .it('should display formatted output', (ctx) => {
    expect(ctx.stdout).toContain('Organization: myOrg');
    expect(ctx.stdout).toMatch(/Region:\s+US/);
  });
```

## Testing Async Operations

### Promises and Async/Await

```typescript
it('should handle async operations', async () => {
  const result = await asyncFunction();
  expect(result).toEqual(expectedValue);
});

it('should handle rejected promises', async () => {
  await expect(asyncFunction()).rejects.toThrow('Error message');
});
```

### Mocking Async Functions

```typescript
const mockAsyncFn = jest.fn().mockResolvedValue('success');
const mockRejectedFn = jest.fn().mockRejectedValue(new Error('failed'));

// In test
const result = await mockAsyncFn();
expect(result).toBe('success');

await expect(mockRejectedFn()).rejects.toThrow('failed');
```

## Testing Error Handling

### Expected Errors

```typescript
it('should throw error for invalid input', () => {
  expect(() => functionThatThrows()).toThrow('Invalid input');
  expect(() => functionThatThrows()).toThrow(InternalError);
});

it('should handle errors gracefully', async () => {
  await expect(asyncFunctionThatFails()).rejects.toThrow('Expected error');
});
```

### oclif Error Testing

```typescript
test
  .command(['my:command', '--invalid'])
  .catch(/Error: Invalid flag/)
  .it('should fail with error message');

test
  .command(['my:command'])
  .exit(1)
  .it('should exit with code 1 on failure');
```

## Testing Cross-Platform Behavior

### Platform-Specific Tests

When testing code that behaves differently on Windows (PowerShell) vs Unix:

```typescript
describe('cross-platform behavior', () => {
  const originalPlatform = process.platform;

  afterEach(() => {
    Object.defineProperty(process, 'platform', {
      value: originalPlatform,
    });
  });

  it('should use PowerShell on Windows', () => {
    Object.defineProperty(process, 'platform', {
      value: 'win32',
    });

    const result = getShellCommand();
    expect(result).toBe('powershell');
  });

  it('should use default shell on Unix', () => {
    Object.defineProperty(process, 'platform', {
      value: 'linux',
    });

    const result = getShellCommand();
    expect(result).toBeUndefined();
  });
});
```

## Test Data and Fixtures

### Mock Data

Keep mock data close to where it's used or in a fixtures directory:

```typescript
const mockOrganization = {
  id: 'test-org-id',
  name: 'Test Organization',
  region: 'us',
};

const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
};
```

### Reusable Test Utilities

Common test utilities are in `packages/cli/commons-dev/src/testUtils/`:

```typescript
import {it} from '@coveo/cli-commons-dev/testUtils/it';
import {fsUtils} from '@coveo/cli-commons-dev/testUtils/fsUtils';
```

## Snapshot Testing

Use snapshot testing for complex output that rarely changes:

```typescript
it('should match snapshot', () => {
  const output = generateComplexOutput();
  expect(output).toMatchSnapshot();
});
```

Update snapshots with:
```bash
npm run test -- -u
```

## Test Coverage

### What to Test

**Do test**:
- Command logic and flag handling
- Error conditions and edge cases
- Integration between components
- Cross-platform behavior (Windows/Unix)
- User-facing output and messages

**Don't test**:
- Third-party libraries (they have their own tests)
- Simple getters/setters without logic
- Generated code or boilerplate

### Coverage Guidelines

- **Unit tests**: Test individual functions and methods in isolation
- **Integration tests**: Test command flows with mocked external dependencies
- **E2E tests**: In `packages/cli-e2e/` - test full command execution

## Running Tests

### Run All Tests

```bash
npm run test
```

### Run Specific Package Tests

```bash
npm run test -- --scope=@coveo/cli
```

### Run in Watch Mode

```bash
npm run test -- --watch
```

### Run with Coverage

```bash
npm run test -- --coverage
```

## Best Practices

1. **Test behavior, not implementation**: Focus on what the code does, not how it does it
2. **Use descriptive test names**: `it('should login successfully with valid credentials')`
3. **One assertion per test when possible**: Makes failures easier to diagnose
4. **Mock external dependencies**: Keep tests fast and reliable
5. **Reset mocks between tests**: Use `jest.clearAllMocks()` in `beforeEach`
6. **Test error paths**: Don't just test happy paths
7. **Keep tests independent**: Tests should not depend on each other's state
8. **Use TypeScript in tests**: Get type safety and better IDE support
9. **Test cross-platform if relevant**: Consider Windows PowerShell behavior

## Common Pitfalls to Avoid

1. **Not resetting mocks**: Can cause test pollution between tests
2. **Testing implementation details**: Makes tests brittle to refactoring
3. **Forgetting to await async operations**: Leads to false positives
4. **Over-mocking**: Mocking too much can make tests meaningless
5. **Not testing error cases**: Happy path testing is insufficient
6. **Slow tests**: Avoid network calls, file I/O, or expensive operations
7. **Snapshot overuse**: Can hide real issues when snapshots are blindly updated

## Key Points for AI Assistants

1. **Co-locate tests**: Tests go next to implementation with `.spec.ts` extension
2. **Mock at the top**: Use `jest.mock()` before imports
3. **Use @oclif/test**: For testing CLI commands
4. **Reset mocks**: Always use `beforeEach` to clear mock state
5. **Test cross-platform**: Consider Windows PowerShell when relevant
6. **Descriptive names**: Use clear, behavior-focused test descriptions
7. **Type safety**: Use `jest.mocked()` for typed mock references
