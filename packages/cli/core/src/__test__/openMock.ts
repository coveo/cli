import type {ChildProcess} from 'child_process';

const open = jest.fn(async () => ({unref() {}}) as unknown as ChildProcess);

export default open;
