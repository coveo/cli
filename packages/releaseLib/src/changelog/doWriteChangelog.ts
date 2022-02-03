import {join} from 'node:path';
import {
  createReadStream,
  createWriteStream,
  statSync,
  truncateSync,
  writeFileSync,
  ReadStream,
} from 'node:fs';
import tempfile from 'tempfile';

export default async function (PATH: string, changelog: string) {
  const changelogPath = join(PATH, 'CHANGELOG.md');
  ensureChangelogExist(changelogPath);

  const previousChangelogReadable = await getPreviousChangelogStream(
    changelogPath
  );

  truncateSync(changelogPath);
  const changelogWritable = createWriteStream(changelogPath);
  changelogWritable.write(changelog);

  return new Promise((resolve) => {
    previousChangelogReadable.pipe(changelogWritable).once('finish', resolve);
  });
}

function ensureChangelogExist(changelogPath: string) {
  if (!statSync(changelogPath, {throwIfNoEntry: false})) {
    writeFileSync(changelogPath, '');
  }
}

function getPreviousChangelogStream(changelogPath: string) {
  const tmp = tempfile();
  return new Promise<ReadStream>((resolve) => {
    createReadStream(changelogPath)
      .pipe(createWriteStream(tmp))
      .once('finish', () => resolve(createReadStream(tmp)));
  });
}
