import {ensureComponentValidity} from './validation.js';

describe('validation', () => {
  const validate = (str: string) => () => ensureComponentValidity(str);

  describe('ensureComponentValidity', () => {
    it.each([' my-tag', 'my-tag ', ' my-tag '])(
      'should error on whitespace',
      (str) => {
        expect(validate(str)).toThrow('Tag can not contain white spaces');
      }
    );

    it('should error on upper case', () => {
      expect(validate('My-Tag')).toThrow(
        'Tag can not contain upper case characters'
      );
    });

    it('should error on empty string', () => {
      expect(validate('')).toThrow('Received empty tag value');
    });

    it('should error on inner whitespace', () => {
      expect(validate('my- tag')).toThrow(
        '"my- tag" tag cannot contain a space'
      );
    });

    it('should error on comma', () => {
      expect(validate('my-tag,your-tag')).toThrow(
        '"my-tag,your-tag" tag cannot be used for multiple tags'
      );
    });

    it.each(['你-好', 'my-@component', '!@#$!@#4-ohno'])(
      'should error on any invalid characters',
      (funkyTag) => {
        expect(validate(funkyTag)).toThrow(
          `"${funkyTag}" tag contains invalid characters: ${funkyTag.replace(
            /\w|-/g,
            ''
          )}`
        );
      }
    );

    it('should error if no dash', () => {
      expect(validate('dashless')).toThrow(
        '"dashless" tag must contain a dash (-) to work as a valid web component'
      );
    });

    it('should error on multiple dashes in a row', () => {
      expect(validate('dash--crazy')).toThrow(
        '"dash--crazy" tag cannot contain multiple dashes (--) next to each other'
      );
    });

    it('should error on leading dash', () => {
      expect(validate('-dash')).toThrow(
        '"-dash" tag cannot start with a dash (-)'
      );
    });

    it('should error on trailing dash', () => {
      expect(validate('dash-')).toThrow(
        '"dash-" tag cannot end with a dash (-)'
      );
    });
  });
});
