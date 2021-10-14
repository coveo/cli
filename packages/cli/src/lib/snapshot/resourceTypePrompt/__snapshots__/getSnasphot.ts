import {readFileSync} from 'fs';
import {resolve} from 'path';

export default function (snapshotName: string) {
  return readFileSync(resolve(__dirname, snapshotName), {encoding: 'utf-8'});
}
