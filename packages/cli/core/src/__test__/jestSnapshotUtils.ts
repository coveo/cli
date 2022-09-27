import strip from 'strip-ansi';

// See https://github.com/oclif/core/blob/f996086397158b5beafc4254718c78fd93d23b1b/src/errors/errors/cli.ts#L55-L60
export const formatCliLog = (input: string, stripAinsi = false) => {
  const formatted = input.replaceAll(/\r\n/gm, '\n').replaceAll(/»/g, '›');
  return stripAinsi ? strip(formatted) : formatted;
};
