import {red, green, bold} from 'chalk';

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
  log([green('✔'), bold(message)].join(' '));
}

export function fail(message: string) {
  log([red('✖'), bold(message)].join(' '));
}
