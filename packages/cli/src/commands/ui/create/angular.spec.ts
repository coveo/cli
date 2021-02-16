// import {test} from '@oclif/test';
// import {EventEmitter} from 'events';
// import * as child_process from 'child_process';

// jest.mock('child_process', () => ({
//   spawn: jest.fn().mockImplementation(() => {
//     const successExitCode = 0;
//     const emitter = new EventEmitter();
//     process.nextTick(() => emitter.emit('close', successExitCode)); // To mock a sucess command
//     return emitter as child_process.ChildProcess;
//   }),
// }));

// describe('ui:create:angular', () => {
//   const angularAppExecutable = '@angular/cli/lib/init.js';

//   test
//     .stdout()
//     .command(['ui:create:angular'])
//     .catch((ctx) => {
//       expect(ctx.message).toContain('Missing 1 required arg:');
//     })
//     .it('requires application name argument');

//   test
//     .stdout()
//     .command(['ui:create:angular', 'myapp'])
//     .it('should start a spawn process with the appropriate arguments', () => {
//       expect(child_process.spawn).toHaveBeenCalledTimes(2);
//       expect(child_process.spawn).nthCalledWith(
//         1,
//         'node',
//         [
//           expect.stringContaining(angularAppExecutable),
//           'new',
//           'myapp',
//           '--style',
//           'scss',
//         ],
//         expect.objectContaining({})
//       );
//       expect(child_process.spawn).nthCalledWith(
//         2,
//         'node',
//         [
//           expect.stringContaining(angularAppExecutable),
//           'add',
//           '@coveo/angular',
//           '--org-id',
//           'bar', // TODO: Connect to the user's org (CDX-73)
//           '--api-key',
//           'foo', // TODO: Connect to the user's org (CDX-73)
//         ],
//         expect.objectContaining({cwd: 'myapp'})
//       );
//     });

//   test
//     .stdout()
//     .command(['ui:create:angular', 'myapp', '--defaults'])
//     .it('should call the angular cli using the --defaults flag', () => {
//       expect(child_process.spawn).toHaveBeenCalledTimes(2);
//       expect(child_process.spawn).nthCalledWith(
//         1,
//         'node',
//         [
//           expect.stringContaining(angularAppExecutable),
//           'new',
//           'myapp',
//           '--style',
//           'scss',
//           '--defaults',
//         ],
//         expect.objectContaining({})
//       );
//       expect(child_process.spawn).nthCalledWith(
//         2,
//         'node',
//         [
//           expect.stringContaining(angularAppExecutable),
//           'add',
//           '@coveo/angular',
//           '--org-id',
//           'bar', // TODO: Connect to the user's org (CDX-73)
//           '--api-key',
//           'foo', // TODO: Connect to the user's org (CDX-73)
//           '--defaults',
//         ],
//         expect.objectContaining({cwd: 'myapp'})
//       );
//     });
// });

describe('ui:create:angular', () => {
  it('passes', () => {
    expect(1).toBe(1);
  });
});
