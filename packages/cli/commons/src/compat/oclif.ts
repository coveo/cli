import type {Command as OclifCommand} from '@oclif/core';
import inquirer from 'inquirer';

type CoreModule = typeof import('@oclif/core');

class FallbackCLIError extends Error {
  public oclif = {};
}

const createFlag = <T>(flag: T) => flag;

const fallbackCore = {
  Args: {
    string: createFlag,
  },
  Command: class {},
  Errors: {CLIError: FallbackCLIError},
  Flags: {
    boolean: createFlag,
    custom: createFlag,
    integer: createFlag,
    option: createFlag,
    string: createFlag,
  },
  Interfaces: {},
  run: async () => undefined,
  ux: {
    action: {
      running: false,
      start() {},
      stop() {},
    },
    error(error: string | Error, _options?: {exit?: boolean}) {
      throw error;
    },
    log() {},
    stderr() {},
    stdout() {},
  },
} as unknown as CoreModule;

const core = (() => {
  try {
    // Some unit tests mock fs internals in ways that break @oclif/core bootstrap.
    // Fall back to a lightweight stub for those tests.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('@oclif/core') as CoreModule;
  } catch {
    return fallbackCore;
  }
})();

export const Errors = core.Errors ?? fallbackCore.Errors;
export const run = core.run ?? fallbackCore.run;
const baseUx = core.ux ?? fallbackCore.ux;
const baseArgs = core.Args ?? fallbackCore.Args;
const actionState = {
  running: false,
  status: '',
  task: '',
};

const normalizeLegacyArgs = (commandClass: Record<string, unknown>) => {
  const args = commandClass.args;

  if (!Array.isArray(args) || commandClass.__legacyArgsNormalized) {
    return;
  }

  commandClass.args = Object.fromEntries(
    args.map((arg) => [arg.name, baseArgs.string(arg)])
  );
  commandClass.__legacyArgsNormalized = true;
};

const BaseCommand = (core.Command ?? fallbackCore.Command) as any;

abstract class CompatCommand extends BaseCommand {
  protected parse(options?: unknown, argv?: string[]) {
    normalizeLegacyArgs(
      (options as Record<string, unknown>) ?? (this.ctor as any)
    );
    return super.parse(options as any, argv) as any;
  }
}

const option = (
  defaults: Record<string, unknown> & {options: readonly string[]}
) =>
  (
    core.Flags.custom({
      async parse(input, _ctx, opts) {
        const values = (opts.options ?? defaults.options) as readonly string[];

        if (values && !values.includes(input)) {
          throw new Errors.CLIError(
            `Expected ${input} to be one of: ${values.join(', ')}`
          );
        }

        return input;
      },
    }) as any
  )(defaults);

export const Command = CompatCommand as unknown as typeof OclifCommand;
export const Flags = {
  ...(core.Flags ?? fallbackCore.Flags),
  option,
};
export const ux = {
  ...baseUx,
  action: {
    get running() {
      return actionState.running;
    },
    get status() {
      return actionState.status.trimStart();
    },
    set status(value: string) {
      actionState.status = value ? ` ${value}` : '';
    },
    start(task: string, status?: string) {
      actionState.running = true;
      actionState.status = status ? ` ${status}` : '';
      actionState.task = task;
    },
    stop(message = '') {
      if (!actionState.running) {
        return;
      }

      const suffix = message ? ` ${message}` : '';
      process.stderr.write(
        `${actionState.task}${actionState.status}...${suffix}\n`
      );
      actionState.running = false;
      actionState.status = '';
      actionState.task = '';
    },
  },
  stderr(message = '') {
    process.stderr.write(`${message}\n`);
  },
  stdout(message = '') {
    process.stdout.write(`${message}\n`);
  },
  error(error: string | Error, _options?: {exit?: boolean}): never {
    if (error instanceof Error) {
      throw error;
    }

    throw new Errors.CLIError(error);
  },
};

type TableColumn<T> = {
  extended?: boolean;
  get?: (row: T) => unknown;
  header?: string;
};

type TableColumns<T> = Record<string, TableColumn<T>>;

type TableOptions = {
  columns?: string[];
  csv?: boolean;
  extended?: boolean;
  header?: boolean;
  output?: 'csv' | 'json';
  sort?: string;
};

const toPrintableValue = (value: unknown) =>
  value instanceof Date ? value.toISOString() : value;

const stripAnsi = (value: string) => value.replaceAll(/\x1B\[[0-9;]*m/g, '');

const visibleLength = (value: string) => stripAnsi(value).length;

const humanizeHeader = (value: string) =>
  value
    .replaceAll(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/^./, (char) => char.toUpperCase());

const renderCsv = (rows: Record<string, unknown>[]) => {
  if (rows.length === 0) {
    return;
  }

  const headers = Object.keys(rows[0]);
  ux.stdout(headers.join(','));
  for (const row of rows) {
    ux.stdout(
      headers
        .map((header) =>
          JSON.stringify(toPrintableValue(row[header]) ?? '').replace(
            /^"|"$/g,
            ''
          )
        )
        .join(',')
    );
  }
};

const renderTable = <T>(
  rows: T[],
  columns: TableColumns<T>,
  options: TableOptions = {}
) => {
  const visibleColumns = Object.entries(columns).filter(
    ([key, column]) => !options.columns?.length || options.columns.includes(key)
  );
  const normalizedColumns = visibleColumns.filter(
    ([, column]) => options.extended || !column.extended
  );
  const dataRows = rows.map((row) =>
    Object.fromEntries(
      normalizedColumns.map(([key, column]) => [
        key,
        toPrintableValue(column.get ? column.get(row) : (row as any)[key]),
      ])
    )
  );

  if (options.sort) {
    dataRows.sort((left, right) =>
      String(left[options.sort!] ?? '').localeCompare(
        String(right[options.sort!] ?? '')
      )
    );
  }

  if (options.output === 'json') {
    styledJSON(dataRows);
    return;
  }

  if (options.csv || options.output === 'csv') {
    renderCsv(dataRows);
    return;
  }

  if (dataRows.length === 0) {
    return;
  }

  const headers = normalizedColumns.map(
    ([key, column]) => column.header ?? humanizeHeader(key)
  );
  const stringRows = dataRows.map((row) =>
    normalizedColumns.map(([key]) => stripAnsi(String(row[key] ?? '')))
  );
  const widths = headers.map((header, index) =>
    Math.max(
      visibleLength(header),
      ...stringRows.flatMap((row) =>
        row[index].split('\n').map((line) => line.length)
      )
    )
  );
  const formatLine = (cells: string[]) =>
    ` ${cells
      .map(
        (cell, index) =>
          `${cell}${' '.repeat(Math.max(widths[index] - visibleLength(cell), 0))}`
      )
      .join(' ')} `;

  if (options.header !== false) {
    ux.stdout(formatLine(headers));
    ux.stdout(formatLine(widths.map((width) => '─'.repeat(width))));
  }
  stringRows.forEach((row) => {
    const cellLines = row.map((cell) => cell.split('\n'));
    const rowHeight = Math.max(...cellLines.map((lines) => lines.length));

    for (let lineIndex = 0; lineIndex < rowHeight; lineIndex++) {
      ux.stdout(formatLine(cellLines.map((lines) => lines[lineIndex] ?? '')));
    }
  });
};

const table = Object.assign(renderTable, {
  flags: () => ({
    columns: Flags.string({
      description: 'Columns to display',
      multiple: true,
      required: false,
    }),
    csv: Flags.boolean({
      default: false,
      description: 'Format output as csv',
      required: false,
    }),
    extended: Flags.boolean({
      char: 'x',
      default: false,
      description: 'Show extended columns',
      required: false,
    }),
    header: Flags.boolean({
      allowNo: true,
      default: true,
      description: 'Show table header',
      required: false,
    }),
    output: option({
      description: 'Format output as json or csv',
      options: ['json', 'csv'],
      required: false,
    }),
    sort: Flags.string({
      description: 'Property used to sort rows',
      required: false,
    }),
  }),
});

const styledJSON = (value: unknown) =>
  ux.stdout(JSON.stringify(value, null, 2));

const styledHeader = (header: string) => {
  ux.stdout(`=== ${header}`);
};

const prompt = async (
  message: string,
  options?: {prompt?: string; required?: boolean; type?: string}
) => {
  const response = await inquirer.prompt<{value: string}>([
    {
      message: options?.prompt ?? message,
      name: 'value',
      type: options?.type === 'hide' ? 'password' : 'input',
      validate: (value: string) =>
        options?.required === false || value ? true : 'Value is required',
    },
  ]);

  return response.value;
};

const confirm = async (message: string) => {
  const response = await inquirer.prompt<{value: boolean}>([
    {
      message,
      name: 'value',
      type: 'confirm',
    },
  ]);

  return response.value;
};

const progress = (options?: {format?: string}) => {
  try {
    // `cli-progress` is only used by the main CLI package.
    // Keep the compat layer optional so commons stays usable on its own.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const cliProgress = require('cli-progress') as any;
    return new cliProgress.SingleBar(
      {format: options?.format},
      cliProgress.Presets.shades_classic
    );
  } catch {
    return {
      increment() {},
      start() {},
      stop() {},
      update() {},
    };
  }
};

export type Example = OclifCommand.Example;
export type Hook<T extends string = string> = any;
export declare namespace Interfaces {
  export type Config = import('@oclif/core').Interfaces.Config;
}
export type FlagOutput = Record<string, unknown>;

export const CliUx = {
  ux: {
    ...ux,
    confirm,
    info: ux.stdout,
    log: ux.stdout,
    progress,
    prompt,
    styledHeader,
    styledJSON,
    table,
  },
};
