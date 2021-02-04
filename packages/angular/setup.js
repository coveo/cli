const {copyFile, copy, ensureDir, pathExists} = require('fs-extra');
const collection = require('./src/collection.json');

async function copySchemas() {
  await ensureDir(destDir);
  const schematics = Object.values(collection.schematics);
  return Promise.all(
    schematics.map((sch) =>
      copy(`${srcDir}/${sch.schema}`, `${destDir}/${sch.schema}`)
    )
  );
}

async function copyFiles(srcDir, destDir) {
  await ensureDir(destDir);
  const schematics = Object.keys(collection.schematics);
  return Promise.all(
    schematics.map(async (sch) => {
      if (await pathExists(`${srcDir}/${sch}/files`)) {
        return copy(`${srcDir}/${sch}/files`, `${destDir}/${sch}/files`);
      }
    })
  );
}

async function copyCollection(srcDir, destDir) {
  await ensureDir(destDir);
  return copyFile(`${srcDir}/collection.json`, `${destDir}/collection.json`);
}

const srcDir = './src';
const destDir = './dist';

Promise.all([
  copySchemas(srcDir, destDir),
  copyFiles(srcDir, destDir),
  copyCollection(srcDir, destDir),
])
  .then(() => {
    console.log('Ready to pack');
  })
  .catch((err) => {
    console.error(err);
  });
