import {stdout} from 'stdout-stderr';
import {failure, log, newLine, success} from './logger';

describe('Logger', () => {
  beforeEach(() => {
    stdout.start();
  });

  afterEach(() => {
    stdout.stop();
  });

  it('#log should print multiple lines to stdout', () => {
    log('Maecenas purus lacus', 'Donec ut sem cursus');
    expect(stdout.output).toMatchSnapshot();
  });

  it('#success should print a successful message', () => {
    success('You win!');
    expect(stdout.output).toMatchSnapshot();
  });

  it('#failure should print an error message', () => {
    failure('Better luck next time');
    expect(stdout.output).toMatchSnapshot();
  });

  it('#newLine should print a new line', () => {
    newLine();
    expect(stdout.output).toMatchSnapshot();
  });
});
