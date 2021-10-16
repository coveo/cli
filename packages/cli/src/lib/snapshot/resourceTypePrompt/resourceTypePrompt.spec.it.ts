import {getSelectResourceTypesPrompt, ResourcePromptDefaults} from './index';
import {fancy} from 'fancy-test';
import {MockSTDIN, stdin} from 'mock-stdin';
import {ResourceTypeActions} from './interfaces';
import {SnapshotPullModelResourceType} from '../pullModel/interfaces';
import {ResourceSnapshotType} from '@coveord/platform-client';

describe('ResourceTypePrompt - Integration Test', () => {
  const defaultAnswers: [SnapshotPullModelResourceType, ResourceTypeActions][] =
    [
      [ResourceSnapshotType.extension, ResourceTypeActions.Skip],
      [ResourceSnapshotType.field, ResourceTypeActions.Skip],
      [ResourceSnapshotType.mlModel, ResourceTypeActions.Skip],
      [ResourceSnapshotType.queryPipeline, ResourceTypeActions.Skip],
      [ResourceSnapshotType.searchPage, ResourceTypeActions.Skip],
      [ResourceSnapshotType.source, ResourceTypeActions.Skip],
      [ResourceSnapshotType.subscription, ResourceTypeActions.Skip],
    ];

  const arrowKeys = {
    up: '\x1b[A',
    down: '\x1b[B',
    left: '\x1b[C',
    right: '\x1b[D',
  };

  /**
   * ANSI Escape Sequence - Cursor Horizontal Absolute
   * https://vt100.net/docs/vt510-rm/CHA.html
   * ECMA-48 5th Edition, Section 8.3.9
   * In non-beepboop language: It move the cursor at the beginning of the line.
   */
  const ansiCursorHorizontalAbsolute = '\x1b[G';

  const fancyIt = () =>
    fancy.env({FORCE_COLOR: '3'}).stdout({stripColor: false}).it;
  let mockedStdin: MockSTDIN;

  beforeEach(() => {
    mockedStdin = stdin();
  });

  afterEach(() => {
    mockedStdin.restore();
  });

  describe('when started', () => {
    fancyIt()(
      'should display the question and the first 7 resources',
      (output) => {
        getSelectResourceTypesPrompt('someQuestion');

        expect(output.stdout).toMatchSnapshot();

        mockedStdin.end();
      }
    );
  });

  describe.each([
    ['a', ResourceTypeActions.Add, {}, {EXTENSION: ResourceTypeActions.Skip}],
    ['s', ResourceTypeActions.Skip, {}, null],
    [
      'd',
      ResourceTypeActions.Delete,
      {EXTENSION: ResourceTypeActions.Skip},
      {},
    ],
    ['e', ResourceTypeActions.Edit, {EXTENSION: ResourceTypeActions.Skip}, {}],
  ])(
    'when pressing %s',
    (
      key: string,
      associatedAction: ResourceTypeActions,
      compatibleDefault: ResourcePromptDefaults,
      incompatibleDefault: ResourcePromptDefaults | null
    ) => {
      let answersWithAssociatedAction: [
        SnapshotPullModelResourceType,
        ResourceTypeActions
      ][];

      beforeAll(() => {
        answersWithAssociatedAction = [...defaultAnswers];
        answersWithAssociatedAction.shift();
        answersWithAssociatedAction.unshift([
          ResourceSnapshotType.extension,
          associatedAction,
        ]);
      });

      fancyIt()(
        `should select ${associatedAction} for the highlighted resource if possible`,
        async (output) => {
          const promptPromise = getSelectResourceTypesPrompt(
            'someQuestion',
            compatibleDefault
          );
          const preStdoutLength = output.stdout.length;
          mockedStdin.send(key);

          expect(output.stdout.substr(preStdoutLength)).toMatchSnapshot();
          mockedStdin.send('\n');
          await expect(promptPromise).resolves.toEqual({
            someQuestion: answersWithAssociatedAction,
          });
          mockedStdin.end();
        }
      );

      fancyIt()(
        `should do nothing if the resource is already associated to ${associatedAction}`,
        async (output) => {
          const promptPromise = getSelectResourceTypesPrompt('someQuestion', {
            EXTENSION: associatedAction,
          });
          const preInputStdout = output.stdout;

          mockedStdin.send(key);

          const postInputStdout = output.stdout.split(
            ansiCursorHorizontalAbsolute
          )[1];

          mockedStdin.send('\n');

          expect(postInputStdout).toEqual(preInputStdout);
          await expect(promptPromise).resolves.toEqual({
            someQuestion: answersWithAssociatedAction,
          });
          mockedStdin.end();
        }
      );

      if (incompatibleDefault) {
        fancyIt()(
          'should do nothing if the resource/operation association is invalid',
          async (output) => {
            const promptPromise = getSelectResourceTypesPrompt(
              'someQuestion',
              incompatibleDefault
            );
            const preInputStdout = output.stdout;

            mockedStdin.send(key);

            const postInputStdout = output.stdout.split(
              ansiCursorHorizontalAbsolute
            )[1];

            mockedStdin.send('\n');

            expect(postInputStdout).toEqual(preInputStdout);
            await expect(promptPromise).resolves.toEqual({
              someQuestion: defaultAnswers,
            });
            mockedStdin.end();
          }
        );
      }
    }
  );

  //#region Refactor maybe
  describe.each([
    ['up', arrowKeys.up, false],
    ['down', arrowKeys.down, false],
    ['left', arrowKeys.left, true],
    ['right', arrowKeys.right, true],
  ])('when pressing %s arrow key', (_direction, asciiCode, shouldLoop) => {
    fancyIt()(
      'should select the next valid value/key if there is one',
      (output) => {
        getSelectResourceTypesPrompt('someQuestion');
        const preInputStdout = output.stdout;

        mockedStdin.send(asciiCode);

        const postInputStdout = output.stdout.split(
          ansiCursorHorizontalAbsolute
        )[1];

        expect(postInputStdout).not.toEqual(preInputStdout);
        expect(postInputStdout).toMatchSnapshot();

        mockedStdin.end();
      }
    );

    if (shouldLoop) {
      it.todo('should loop and select the next valid value/key');
    } else {
      it.todo('should do nothing');
    }
  });

  describe('when pressing space bar', () => {
    fancyIt()(
      'should do nothing if the highlighted key/value combination is disabled',
      async (output) => {
        const promptPromise = getSelectResourceTypesPrompt('someQuestion');
        const preInputStdout = output.stdout;

        mockedStdin.send(' ');

        const postInputStdout = output.stdout.split(
          ansiCursorHorizontalAbsolute
        )[1];

        expect(postInputStdout).toEqual(preInputStdout);
        expect(postInputStdout).toMatchSnapshot();

        mockedStdin.end();
        await promptPromise;
      }
    );

    fancyIt()(
      'should select if the highlighted key/value combination is not disabled',
      async (output) => {
        const promptPromise = getSelectResourceTypesPrompt('someQuestion', {});
        const preInputStdout = output.stdout;

        mockedStdin.send(' ');

        const postInputStdout = output.stdout.split(
          ansiCursorHorizontalAbsolute
        )[1];

        expect(postInputStdout).not.toEqual(preInputStdout);
        expect(postInputStdout).toMatchSnapshot();

        mockedStdin.end();
        await promptPromise;
      }
    );
  });

  describe('when pressing enter', () => {
    fancyIt()(
      'should resolves the promise with the returned values',
      async () => {
        const promptPromise = getSelectResourceTypesPrompt('someQuestion');

        mockedStdin.send('\n');
        await expect(promptPromise).resolves.toEqual({
          someQuestion: defaultAnswers,
        });
        mockedStdin.end();
      }
    );
  });
});
