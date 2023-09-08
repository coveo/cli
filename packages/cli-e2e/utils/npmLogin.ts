import {EOL} from 'os';
import {answerPrompt} from './cli';
import {Terminal} from './terminal/terminal';
import {npm} from './npm';
// https://docs.npmjs.com/cli/v9/commands/npm-adduser
export const npmLogin = async () => {
  const args = [
    ...npm(),
    'login',
    '--registry=http://127.0.0.1:4873',
    '--auth-type=legacy',
  ];
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
    .until(/Logged in on/);

  await npmLogin
    .when(/Logged in on/)
    .on('stdout')
    .do()
    .once();
};
