import chalk from 'chalk';

export function log(...messages: string[]) {
  for (const message of messages) {
    console.log(message);
  }
}

export function groupStart() {
  console.group();
}

export function groupEnd() {
  console.groupEnd();
}

export function newLine() {
  console.log();
}

export function success(message: string) {
  log([chalk.green('✔'), message].join(' '));
}

export function failure(message: string) {
  log([chalk.red('✖'), message].join(' '));
}
