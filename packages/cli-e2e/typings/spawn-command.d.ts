declare module 'spawn-command' {
  import type {
    ChildProcessByStdio,
    ChildProcessWithoutNullStreams,
    SpawnOptionsWithoutStdio,
    SpawnOptionsWithStdioTuple,
    StdioPipe,
    StdioNull,
  } from 'child_process';
  import type {Writable, Readable} from 'stream';
  function spawn(
    command: string,
    options?: SpawnOptionsWithoutStdio
  ): ChildProcessWithoutNullStreams;
  function spawn(
    command: string,
    options: SpawnOptionsWithStdioTuple<StdioPipe, StdioPipe, StdioPipe>
  ): ChildProcessByStdio<Writable, Readable, Readable>;
  function spawn(
    command: string,
    options: SpawnOptionsWithStdioTuple<StdioPipe, StdioPipe, StdioNull>
  ): ChildProcessByStdio<Writable, Readable, null>;
  function spawn(
    command: string,
    options: SpawnOptionsWithStdioTuple<StdioPipe, StdioNull, StdioPipe>
  ): ChildProcessByStdio<Writable, null, Readable>;
  function spawn(
    command: string,
    options: SpawnOptionsWithStdioTuple<StdioNull, StdioPipe, StdioPipe>
  ): ChildProcessByStdio<null, Readable, Readable>;
  function spawn(
    command: string,
    options: SpawnOptionsWithStdioTuple<StdioPipe, StdioNull, StdioNull>
  ): ChildProcessByStdio<Writable, null, null>;
  function spawn(
    command: string,
    options: SpawnOptionsWithStdioTuple<StdioNull, StdioPipe, StdioNull>
  ): ChildProcessByStdio<null, Readable, null>;
  function spawn(
    command: string,
    options: SpawnOptionsWithStdioTuple<StdioNull, StdioNull, StdioPipe>
  ): ChildProcessByStdio<null, null, Readable>;
  function spawn(
    command: string,
    options: SpawnOptionsWithStdioTuple<StdioNull, StdioNull, StdioNull>
  ): ChildProcessByStdio<null, null, null>;

  export default spawn;
}
