import {resolve} from 'path';
import {Terminal} from './utils/terminal/terminal';

(async () => {
  await new Terminal(
    resolve(__dirname, '..', 'cli', 'bin', 'run.cmd'),
    ['help'],
    undefined,
    undefined,
    'foobar'
  )
    .when(/.+/)
    .on('stdout')
    .do()
    .once();
})();
