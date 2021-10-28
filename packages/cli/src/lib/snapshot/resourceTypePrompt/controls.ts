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
    this.render();
  };
}

const onAKey = actionToKeyListener(ResourceTypeActions.Add);
const onDKey = actionToKeyListener(ResourceTypeActions.Delete);
const onEKey = actionToKeyListener(ResourceTypeActions.Edit);
const onSKey = actionToKeyListener(ResourceTypeActions.Skip);

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
      ctrl: false,
      meta: false,
      shift: false,
    },
    handler: onAKey,
  },
  {
    key: {
      sequence: 'd',
      name: 'd',
      ctrl: false,
      meta: false,
      shift: false,
    },
    handler: onDKey,
  },
  {
    key: {
      sequence: 'e',
      name: 'e',
      ctrl: false,
      meta: false,
      shift: false,
    },
    handler: onEKey,
  },
  {
    key: {
      sequence: 's',
      name: 's',
      ctrl: false,
      meta: false,
      shift: false,
    },
    handler: onSKey,
  },
];
