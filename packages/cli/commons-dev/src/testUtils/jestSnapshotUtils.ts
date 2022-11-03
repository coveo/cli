// See https://github.com/oclif/core/blob/f996086397158b5beafc4254718c78fd93d23b1b/src/errors/errors/cli.ts#L55-L60
export const formatCliLog = (input: string) =>
  input.replaceAll(/\r\n/gm, '\n').replaceAll(/»/gm, '›');

export const formatAbsolutePath = (input: string) =>
  input.replaceAll(/\w:\\{2}/gm, '/').replaceAll(/\\{2}/gm, '/');

export const removeDotCmd = (input: string) => input.replaceAll(/\.cmd/gm, '');
