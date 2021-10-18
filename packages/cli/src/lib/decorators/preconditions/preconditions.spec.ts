import {fancyIt} from '../../../__test__/it';
import {Preconditions} from './preconditions';
import {getFakeCommand} from './testsUtils/utils';

describe('preconditions', () => {
  const preconditions = new Array<jest.Mock<Boolean>>(5);
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('if all preconditions succeed', () => {
    fancyIt()(
      'should executes preconditions the original command',
      async () => {
        let counter = 0;
        const orderChecker = jest.fn();
        preconditions.fill(
          jest.fn(
            (() => {
              orderChecker(counter++);
              return true;
            }).bind(this)
          )
        );

        const fakeOriginalFunction = jest.fn(async () => {
          orderChecker('final');
        });
        const fakeCommand = getFakeCommand();
        const fakeDescriptor = {
          value: fakeOriginalFunction,
        };

        await Preconditions(...preconditions)(fakeCommand, '', fakeDescriptor);
        await fakeDescriptor.value();

        expect(orderChecker).toHaveBeenCalledTimes(preconditions.length + 1);
        for (let index = 0; index < preconditions.length; index++) {
          expect(orderChecker).toHaveBeenNthCalledWith(index + 1, index);
        }
        expect(fakeOriginalFunction).toHaveBeenCalled();
        expect(orderChecker).toHaveBeenNthCalledWith(
          preconditions.length + 1,
          'final'
        );
      }
    );
  });

  describe('if one precondition failed', () => {
    fancyIt()(
      'should executes all the preconditions prior to the failing one and nothing else',
      async () => {
        let counter = 0;
        const orderChecker = jest.fn();
        preconditions.fill(
          jest.fn(
            (() => {
              orderChecker(counter++);
              return true;
            }).bind(this)
          )
        );
        preconditions[2] = jest.fn(
          (() => {
            orderChecker('fail');
            return false;
          }).bind(this)
        );

        const fakeOriginalFunction = jest.fn(async () => {
          orderChecker('final');
        });
        const fakeCommand = getFakeCommand();
        const fakeDescriptor = {
          value: fakeOriginalFunction,
        };

        await Preconditions(...preconditions)(fakeCommand, '', fakeDescriptor);
        await fakeDescriptor.value();

        expect(orderChecker).toHaveBeenCalledTimes(3);
        for (let index = 0; index < 2; index++) {
          expect(orderChecker).toHaveBeenNthCalledWith(index + 1, index);
        }
        expect(fakeOriginalFunction).not.toHaveBeenCalled();
        expect(orderChecker).toHaveBeenNthCalledWith(3, 'fail');
      }
    );
  });
});
