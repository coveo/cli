import {EOL} from 'os';
import {answerPrompt} from './cli';
import {Terminal} from './terminal/terminal';
import {npm} from './npm';

export const npmLogin = async () => {
  const args = [...npm(), 'login', '--registry=http://localhost:4873'];
  const npmLogin = new Terminal(args.shift()!, args);

  npmLogin.orchestrator.process.stdout.pipe(process.stdout);
  npmLogin.orchestrator.process.stderr.pipe(process.stderr);
  npmLogin
    .when(/Username:/)
    .on('stdout')
    .do(answerPrompt(`notgroot${EOL}`))
    .until(/Password:/);

  npmLogin
    .when(/Password:/)
    .on('stdout')
    .do(answerPrompt(`notGrootButMoreThan10CharactersReally${EOL}`))
    .until(/Email:/);

  npmLogin
    .when(/Email:/)
    .on('stdout')
    .do(answerPrompt(`notGroot@coveo.com${EOL}`))
    .until(/Logged in as/);

  await npmLogin
    .when(/Logged in as/)
    .on('stdout')
    .do()
    .once();
};
