import {format, stripVTControlCharacters} from 'node:util';

type CaptureOptions = {
  print?: boolean;
  stripAnsi?: boolean;
};

type CaptureResult<T = unknown> = {
  error?: Error & {
    code?: number | string;
    exitCode?: number;
    oclif?: {exit?: number};
  };
  result?: T;
  stderr: string;
  stdout: string;
};

type OclifCoreModule = {
  run<T>(argv?: string[], options?: {root: string}): Promise<T>;
};

type CatchExpectation =
  | RegExp
  | string
  | ((err: Error) => unknown | Promise<unknown>);

type CatchOptions = {
  raiseIfNotThrown?: boolean;
};

type TestContext<T = unknown> = CaptureResult<T>;

type TestFn<T = unknown> = (ctx: TestContext<T>) => unknown | Promise<unknown>;

type Action = () => unknown | Promise<unknown>;

type StubDefinition = {
  factory: (stub: jest.Mock) => unknown;
  object: Record<PropertyKey, unknown>;
  path: PropertyKey;
};

type State = {
  actions: Action[];
  catchExpectation?: CatchExpectation;
  catchOptions?: CatchOptions;
  commandArgs?: string | string[];
  expectedExit?: number;
  stubs: StubDefinition[];
};

const actualOclifCore = jest.requireActual('@oclif/core') as OclifCoreModule;

const captureOutput = async <T>(
  fn: () => Promise<unknown>,
  opts?: CaptureOptions
): Promise<CaptureResult<T>> => {
  const print = opts?.print ?? false;
  const stripAnsi = opts?.stripAnsi ?? true;
  const originals = {
    NODE_ENV: process.env.NODE_ENV,
    stderr: process.stderr.write,
    stdout: process.stdout.write,
    consoleError: console.error,
    consoleInfo: console.info,
    consoleLog: console.log,
    consoleWarn: console.warn,
  };
  const output = {
    stderr: [] as string[],
    stdout: [] as string[],
  };
  const toString = (value: unknown) =>
    stripAnsi ? stripVTControlCharacters(String(value)) : String(value);
  const capture = (stream: 'stderr' | 'stdout') =>
    ((
      chunk: string | Uint8Array,
      encodingOrCallback?: BufferEncoding | ((error?: Error | null) => void),
      callback?: (error?: Error | null) => void
    ) => {
      const encoding =
        typeof encodingOrCallback === 'function'
          ? undefined
          : encodingOrCallback;
      const cb =
        typeof encodingOrCallback === 'function'
          ? encodingOrCallback
          : callback;
      const value = Buffer.isBuffer(chunk)
        ? chunk.toString(encoding ?? 'utf8')
        : chunk.toString();
      output[stream].push(value);

      if (print) {
        originals[stream].apply(process[stream], [chunk, encoding as any, cb]);
      } else if (typeof cb === 'function') {
        cb();
      }

      return true;
    }) as typeof process.stdout.write;
  const captureConsole =
    (stream: 'stderr' | 'stdout') =>
    (...args: unknown[]) => {
      const line = `${format(...args)}\n`;
      output[stream].push(line);

      if (print) {
        const original =
          stream === 'stdout' ? originals.consoleLog : originals.consoleError;
        original(...args);
      }
    };
  const serialize = (stream: 'stderr' | 'stdout') =>
    output[stream].map((value) => toString(value)).join('');

  process.stdout.write = capture('stdout');
  process.stderr.write = capture('stderr');
  console.log = captureConsole('stdout');
  console.info = captureConsole('stdout');
  console.warn = captureConsole('stderr');
  console.error = captureConsole('stderr');
  process.env.NODE_ENV = 'test';

  try {
    const result = await fn();
    return {
      result: result as T,
      stderr: serialize('stderr'),
      stdout: serialize('stdout'),
    };
  } catch (error) {
    const normalizedError =
      error instanceof Error
        ? Object.assign(error, {message: toString(error.message)})
        : undefined;

    return {
      ...(normalizedError ? {error: normalizedError} : {}),
      stderr: serialize('stderr'),
      stdout: serialize('stdout'),
    };
  } finally {
    process.stderr.write = originals.stderr;
    process.stdout.write = originals.stdout;
    console.error = originals.consoleError;
    console.info = originals.consoleInfo;
    console.log = originals.consoleLog;
    console.warn = originals.consoleWarn;
    process.env.NODE_ENV = originals.NODE_ENV;
  }
};

class OclifTestCompat<T = unknown> {
  public constructor(
    private readonly state: State = {actions: [], stubs: []}
  ) {}

  public stdout() {
    return this.clone();
  }

  public stderr() {
    return this.clone();
  }

  public command(commandArgs: string | string[]) {
    return this.clone({commandArgs});
  }

  public do(action: Action) {
    return this.clone({actions: [...this.state.actions, action]});
  }

  public stub(
    object: Record<PropertyKey, unknown>,
    path: PropertyKey,
    factory: (stub: jest.Mock) => unknown
  ) {
    return this.clone({
      stubs: [...this.state.stubs, {object, path, factory}],
    });
  }

  public catch(expectation: CatchExpectation, catchOptions?: CatchOptions) {
    return this.clone({
      catchExpectation: expectation,
      catchOptions,
    });
  }

  public exit(expectedExit: number) {
    return this.clone({expectedExit});
  }

  public it(name: string, fn?: TestFn<T>) {
    return it(name, async () => {
      const result = await this.execute();
      if (fn) {
        await fn(result);
      }
    });
  }

  private clone(overrides: Partial<State> = {}) {
    return new OclifTestCompat<T>({
      ...this.state,
      ...overrides,
    });
  }

  private async execute() {
    const restoreFns = this.applyStubs();

    try {
      const result = this.state.commandArgs
        ? await this.runCommand()
        : await this.captureActions();

      await this.assertExpectations(result);
      return result;
    } finally {
      restoreFns.reverse().forEach((restore) => restore());
    }
  }

  private async runCommand() {
    for (const action of this.state.actions) {
      await action();
    }

    const argv = Array.isArray(this.state.commandArgs)
      ? this.state.commandArgs
      : [this.state.commandArgs!];
    const commandRoot =
      process.env.TS_NODE_PROJECT?.replace(/[\\/][^\\/]+$/, '') ??
      process.cwd();

    return captureOutput<T>(
      async () => actualOclifCore.run(argv, {root: commandRoot}),
      {stripAnsi: true}
    );
  }

  private async captureActions() {
    return captureOutput<T>(
      async () => {
        for (const action of this.state.actions) {
          await action();
        }
      },
      {stripAnsi: true}
    );
  }

  private async assertExpectations(result: CaptureResult<T>) {
    const error = result.error;

    if (this.state.catchExpectation) {
      if (!error) {
        if (this.state.catchOptions?.raiseIfNotThrown === false) {
          return;
        }

        throw new Error('Expected command to fail');
      }

      const expectation = this.state.catchExpectation;
      if (typeof expectation === 'function') {
        await expectation(error);
      } else if (typeof expectation === 'string') {
        expect(error.message).toContain(expectation);
      } else {
        expect(error.message).toMatch(expectation);
      }
    } else if (error && this.state.expectedExit === undefined) {
      throw error;
    }

    if (this.state.expectedExit !== undefined) {
      expect(this.getExitCode(error)).toBe(this.state.expectedExit);
    }
  }

  private getExitCode(error?: CaptureResult['error']) {
    return error?.oclif?.exit ?? error?.exitCode ?? error?.code;
  }

  private applyStubs() {
    return this.state.stubs.map(({object, path, factory}) => {
      const descriptor = Object.getOwnPropertyDescriptor(object, path);
      const stub = jest.fn();
      const replacement = factory(stub);

      Object.defineProperty(object, path, {
        configurable: true,
        writable: true,
        value: replacement,
      });

      return () => {
        if (descriptor) {
          Object.defineProperty(object, path, descriptor);
        } else {
          delete object[path];
        }
      };
    });
  }
}

export const test = new OclifTestCompat();
export default test;
