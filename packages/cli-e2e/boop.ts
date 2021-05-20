import {resolve} from 'path';
import {Terminal} from './utils/terminal/terminal';

(async () => {
  await new Terminal(
    'node',
    [resolve(__dirname, '..', 'cli', 'bin', 'run'), 'help'],
    undefined,
    undefined,
    'foobar'
  )
    .when(/.+/)
    .on('stdout')
    .do()
    .once();
})();
