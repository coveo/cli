import {EOL} from 'os';
import {answerPrompt} from './cli';
import {Terminal} from './terminal/terminal';
import {npm} from './npm';

export const npmLogin = async () => {
  console.log('sTart');
  const args = [...npm(), 'adduser', '--registry=http://localhost:4873'];
  const npmAddUser = new Terminal(args.shift()!, args);

  npmAddUser.orchestrator.process.stdout.pipe(process.stdout);
  npmAddUser.orchestrator.process.stderr.pipe(process.stderr);
  npmAddUser
    .when(/Username:/)
    .on('stdout')
    .do(answerPrompt(`notgroot${EOL}`))
    .until(/Password:/);

  npmAddUser
    .when(/Password:/)
    .on('stdout')
    .do(answerPrompt(`notGrootButMoreThan10CharactersReally${EOL}`))
    .until(/Email:/);

  npmAddUser
    .when(/Email:/)
    .on('stdout')
    .do(answerPrompt(`notGroot@coveo.com${EOL}`))
    .until(/Logged in as/);

  await npmAddUser
    .when(/Logged in as/)
    .on('stdout')
    .do()
    .once();
};
