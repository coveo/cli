import {createFiles} from '../../common-rules/templates';
import {CoveoSchema} from '../../schema';
import {dirname} from 'path';

export function createServerDirectory(options: CoveoSchema) {
  const searchTokenServeTemplate = `file://${dirname(
    require.resolve('@coveo/search-token-server')
  )}`;

  return createFiles(options, './server', searchTokenServeTemplate);
}
