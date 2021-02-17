import {createFiles} from '../../common-rules/templates';
import {CoveoSchema} from '../../schema';
import {dirname} from 'path';

export function createEnvironmentFile(options: CoveoSchema) {
  return createFiles(options, './', './files');
}

export function createServerDirectory(options: CoveoSchema) {
  const searchTokenServeTemplate = dirname(
    // eslint-disable-next-line node/no-extraneous-require
    require.resolve('@coveo/search-token-server')
  );

  return createFiles(options, './server', searchTokenServeTemplate);
}
