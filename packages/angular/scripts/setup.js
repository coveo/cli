const {join} = require('path');
const {copyFile, copy, ensureDir, pathExists} = require('fs-extra');
const collection = require('../src/collection.json');

async function copySchema() {
  await ensureDir(destDir);
  const schematics = collection.schematics['ng-add'].schema;
  await copyFile(join(srcDir, schematics), join(destDir, schematics));
}

async function copyFiles(srcDir, destDir) {
  await ensureDir(destDir);
  const schematics = Object.keys(collection.schematics);
  return Promise.all(
    schematics.map(async (sch) => {
      if (await pathExists(`${srcDir}/${sch}/files`)) {
        return copy(join(srcDir, sch, 'files'), join(destDir, sch, 'files'), {
          filter: (src) => !src.endsWith('.d.ts'),
        });
      }
    })
  );
}

async function copyCollection(srcDir, destDir) {
  await ensureDir(destDir);
  return copyFile(
    join(srcDir, 'collection.json'),
    join(destDir, 'collection.json')
  );
}

const srcDir = './src';
const destDir = './dist';

Promise.all([
  copySchema(srcDir, destDir),
  copyFiles(srcDir, destDir),
  copyCollection(srcDir, destDir),
])
  .then(() => {
    console.log('Ready to pack');
  })
  .catch((err) => {
    console.error(err);
  });
