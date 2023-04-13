import {ensureComponentValidity} from './validation.js';

describe('validation', () => {
  const leadingSpaceTag = ' my-tag';
  const trailingSpaceTag = 'my-tag ';
  const surroundingSpacesTag = ' my-tag ';
  const upperCaseTag = 'My-Tag';
  const emptyStringTag = '';
  const spaceTag = 'my- tag';
  const specialCharacterTags = ['你-好', 'my-@component', '!@#$!@#4-ohno'];
  const dashlessTag = 'dashless';
  const dashCrazyTag = 'dash--crazy';
  const trailingDashTag = 'dash-';
  const leadingDashTag = '-dash';
  const messedUpTag = '-My#--Component@-';

  const validate = (str: string) => () => ensureComponentValidity(str);
  const assertAllAggregateErrorsFired = (
    tag: string,
    ...expectedErrorMessages: string[]
  ) => {
    try {
      ensureComponentValidity(tag);
    } catch (error) {
      const aggregatedErrors: Error[] = (error as AggregateError).errors;
      const aggregatedErrorMessages: string[] = aggregatedErrors.map(
        ({message}) => message
      );

      expect(aggregatedErrorMessages).toEqual(
        expect.arrayContaining(expectedErrorMessages)
      );
    }
    expect.assertions(1);
  };

  describe('ensureComponentValidity', () => {
    it.each([
      leadingSpaceTag,
      trailingSpaceTag,
      surroundingSpacesTag,
      upperCaseTag,
      emptyStringTag,
      spaceTag,
      dashlessTag,
      dashCrazyTag,
      trailingDashTag,
      leadingDashTag,
      ...specialCharacterTags,
    ])('should throw an invalid tag name Aggregate error for "%s"', (str) => {
      expect(validate(str)).toThrow('Invalid component tag name');
      try {
        validate(str);
      } catch (error) {
        expect(error).toBeInstanceOf(AggregateError);
      }
    });

    it.each([leadingSpaceTag, trailingSpaceTag, surroundingSpacesTag])(
      'should error on whitespace for "%s"',
      (str) => {
        assertAllAggregateErrorsFired(
          str,
          `"${str}" tag cannot contain a space`
        );
      }
    );

    it('should error on upper case', () => {
      assertAllAggregateErrorsFired(
        upperCaseTag,
        'Tag can not contain upper case characters'
      );
    });

    it('should error on inner whitespace', () => {
      assertAllAggregateErrorsFired(
        spaceTag,
        '"my- tag" tag cannot contain a space'
      );
    });

    it.each(specialCharacterTags)(
      'should error on any invalid characters for "%s"',
      (funkyTag) => {
        assertAllAggregateErrorsFired(
          funkyTag,
          `"${funkyTag}" tag contains invalid characters: ${funkyTag.replace(
            /\w|-/g,
            ''
          )}`
        );
      }
    );

    it('should error if no dash', () => {
      assertAllAggregateErrorsFired(
        dashlessTag,
        '"dashless" tag must contain a dash (-) to work as a valid web component'
      );
    });

    it('should error on multiple dashes in a row', () => {
      assertAllAggregateErrorsFired(
        dashCrazyTag,
        '"dash--crazy" tag cannot contain multiple dashes (--) next to each other'
      );
    });

    it('should error on leading dash', () => {
      assertAllAggregateErrorsFired(
        leadingDashTag,
        '"-dash" tag cannot start with a dash (-)'
      );
    });

    it('should error on trailing dash', () => {
      assertAllAggregateErrorsFired(
        trailingDashTag,
        '"dash-" tag cannot end with a dash (-)'
      );
    });

    it('should error on empty string', () => {
      assertAllAggregateErrorsFired(
        emptyStringTag,
        'Received empty tag value',
        '"" tag must contain a dash (-) to work as a valid web component'
      );
    });

    it('should error on multiple rules', () => {
      assertAllAggregateErrorsFired(
        messedUpTag,
        'Tag can not contain upper case characters',
        `"${messedUpTag}" tag contains invalid characters: #@`,
        `"${messedUpTag}" tag cannot contain multiple dashes (--) next to each other`,
        `"${messedUpTag}" tag cannot start with a dash (-)`,
        `"${messedUpTag}" tag cannot end with a dash (-)`
      );
    });
  });
});
