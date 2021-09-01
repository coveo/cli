import {Transform} from 'stream';
import {ReactStdoutTransformer} from './reactStdoutTransformer';

class SpyTransform extends Transform {
  public constructor(public spy: jest.Mock) {
    super({transform: spy});
  }
}

describe('ReactStdoutTransformer', () => {
  let transformer: ReactStdoutTransformer;
  let spyPipe: jest.Mock;

  beforeEach(() => {
    spyPipe = jest.fn();
    transformer = new ReactStdoutTransformer('myapp');
    transformer.pipe(new SpyTransform(spyPipe));
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('when the react project completion message is piped in', () => {
    it('should not write it in stdout', () => {
      transformer.write('Success! Created myapp');

      expect(spyPipe).not.toBeCalled();
    });

    it('should keep it aside', () => {
      transformer.write('Success! Created myapp');

      expect(transformer.remainingStdout).toBe('Success! Created myapp');
    });
  });

  describe('when some random text is piped in', () => {
    describe('if the react project completion message did not arrived yet', () => {
      it('should write it to stdout', () => {
        transformer.write('Some text');

        expect(spyPipe).toBeCalledTimes(1);
        expect(spyPipe.mock.calls[0][0].toString()).toBe('Some text');
      });
    });

    describe('if the react project completion message already arrived', () => {
      it('should not write it to stdout', () => {
        transformer.write('Success! Created myapp');
        transformer.write('Some text');

        expect(spyPipe).not.toBeCalled();
      });

      it('should store the text', () => {
        transformer.write('Success! Created myapp');
        transformer.write(' Some text');

        expect(transformer.remainingStdout).toBe(
          'Success! Created myapp Some text'
        );
      });
    });
  });
});
