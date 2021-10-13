import type {Key} from 'readline';
import {
  CustomizablePrompt,
  PointerDirection,
  KeyHandler,
} from 'inquirer-customizable';
import {ResourceTypeActions} from './interfaces';

function onUpKey(this: CustomizablePrompt) {
  this.updatePointer(PointerDirection.Up);
  this.render();
}

function onDownKey(this: CustomizablePrompt) {
  this.updatePointer(PointerDirection.Down);
  this.render();
}

function onLeftKey(this: CustomizablePrompt) {
  this.updatePointer(PointerDirection.Left);
  this.render();
}

function onRightKey(this: CustomizablePrompt) {
  this.updatePointer(PointerDirection.Right);
  this.render();
}

function actionToKeyListener(action: ResourceTypeActions) {
  let valueIndex: number | undefined;
  return function (this: CustomizablePrompt) {
    if (!valueIndex) {
      valueIndex = this.values.realChoices.findIndex(
        (value) => value.short === action
      );
    }
    this.assignValueToKey(this.pointer[1], valueIndex);
  };
}

const onCtrlAChord = actionToKeyListener(ResourceTypeActions.Add);
const onCtrlDChord = actionToKeyListener(ResourceTypeActions.Delete);
const onCtrlEChord = actionToKeyListener(ResourceTypeActions.Edit);
const onCtrlSChord = actionToKeyListener(ResourceTypeActions.Skip);

function onSpaceKey(this: CustomizablePrompt) {
  this.assignValueToKey(this.pointer[1], this.pointer[0]);
  this.render();
}

export const checkboxControls: {key: Key; handler: KeyHandler}[] = [
  {
    key: {
      sequence: '\u001b[A',
      name: 'up',
      ctrl: false,
      meta: false,
      shift: false,
    },
    handler: onUpKey,
  },
  {
    key: {
      sequence: '\u001b[B',
      name: 'down',
      ctrl: false,
      meta: false,
      shift: false,
    },
    handler: onDownKey,
  },
  {
    key: {
      sequence: '\u001b[C',
      name: 'right',
      ctrl: false,
      meta: false,
      shift: false,
    },
    handler: onRightKey,
  },
  {
    key: {
      sequence: '\u001b[D',
      name: 'left',
      ctrl: false,
      meta: false,
      shift: false,
    },
    handler: onLeftKey,
  },
  {
    key: {
      sequence: ' ',
      name: 'space',
      ctrl: false,
      meta: false,
      shift: false,
    },
    handler: onSpaceKey,
  },
  {
    key: {
      sequence: 'a',
      name: 'a',
      ctrl: true,
      meta: false,
      shift: false,
    },
    handler: onCtrlAChord,
  },
  {
    key: {
      sequence: 'd',
      name: 'd',
      ctrl: true,
      meta: false,
      shift: false,
    },
    handler: onCtrlDChord,
  },
  {
    key: {
      sequence: 'e',
      name: 'e',
      ctrl: true,
      meta: false,
      shift: false,
    },
    handler: onCtrlEChord,
  },
  {
    key: {
      sequence: 's',
      name: 's',
      ctrl: true,
      meta: false,
      shift: false,
    },
    handler: onCtrlSChord,
  },
];
