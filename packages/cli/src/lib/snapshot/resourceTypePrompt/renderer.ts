import type {
  CustomizablePrompt,
  CustomizablePromptAnswers,
} from 'inquirer-customizable';

import Choice from 'inquirer/lib/objects/choice';
import chalk, {Chalk} from 'chalk';
import stripAnsi from 'strip-ansi';

let longestKeyDisplayNameLength = 0;
export function renderer(this: CustomizablePrompt, error: string) {
  let message = this.getQuestion();
  let bottomContent = '';
  const choicesStr = renderChoices.call(this, this.pointer);

  message += '\n' + this.paginator.paginate(choicesStr, this.pointer[1]);

  if (error) {
    bottomContent = chalk.red('>> ') + error;
  }

  this.screen.render(message, bottomContent);
}

function renderChoices(this: CustomizablePrompt, pointer: [number, number]) {
  let output = '';
  if (!longestKeyDisplayNameLength) {
    longestKeyDisplayNameLength = getLongestStringLength(
      this.keys.realChoices.map((choice) => choice.name)
    );
  }
  this.keys.forEach((choice, i) => {
    if (choice.type === 'separator') {
      output += ` ${choice}\n`;
      return;
    }
    const isCurrentLine = choice === this.keys.realChoices[pointer[1]];
    output +=
      (isCurrentLine ? chalk.cyan`❯` : ' ') +
      choice.name.padEnd(longestKeyDisplayNameLength, ' ') +
      '\t' +
      getRenderedValues.call(
        this,
        choice.short,
        pointer,
        isCurrentLine,
        choice.disabled
      ) +
      '\n';
  });

  return output.replace(/\n$/, '');
}

function getRenderedValues(
  this: CustomizablePrompt,
  key: string,
  pointer: [number, number],
  isCurrentLine: boolean,
  isLineDisabled: boolean
) {
  let renderedValues = '';
  this.values.forEach((choice, i) => {
    if (choice.type === 'separator') {
      renderedValues += ` ${choice}`;
      return;
    }

    const isValueDisabled =
      isLineDisabled ||
      choice.disabled ||
      this.isKeyValuePairDisabled(key, choice.short);
    const isSelected =
      choice === this.values.realChoices[pointer[0]] && isCurrentLine;
    const isCurrentValue = choice.short === this.answers[key];
    renderedValues +=
      ' ' +
      getRenderedValue.call(
        this,
        isCurrentValue,
        isSelected,
        isValueDisabled,
        choice
      );
  });
  return renderedValues;
}

function getRenderedValue(
  this: CustomizablePrompt,
  isCurrentValue: boolean,
  isSelected: boolean,
  isDisabled: boolean,
  choice: Choice<CustomizablePromptAnswers>
) {
  let chalker: Chalk = chalk;
  let name = choice.name;
  if (isCurrentValue) {
    chalker = chalker.underline;
  }
  if (isSelected) {
    chalker = chalker.inverse;
  }
  if (isDisabled) {
    chalker = chalker.gray;
    name = stripAnsi(name);
  }
  return chalker(name);
}

function isString(string: string | undefined): string is string {
  return typeof string === 'string';
}

function getLongestStringLength(strings: (string | undefined)[]): number {
  return strings
    .filter<string>(isString)
    .reduce<number>(
      (currentMax, currentString) => Math.max(currentMax, currentString.length),
      0
    );
}
