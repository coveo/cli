const {copyFile, copy, ensureDir} = require('fs-extra');
const collection = require('./src/collection.json');

async function copySchemas() {
  await ensureDir(destDir);
  Object.values(collection.schematics).forEach((schematic) => {
    copy(`${srcDir}/${schematic.schema}`, `${destDir}/${schematic.schema}`);
  });
}

async function copyFiles(srcDir, destDir) {
  await ensureDir(destDir);
  Object.keys(collection.schematics).forEach((schematic) => {
    copy(`${srcDir}/${schematic}/files`, `${destDir}/${schematic}/files`);
  });
}

async function copyCollection(srcDir, destDir) {
  await ensureDir(destDir);
  copyFile(`${srcDir}/collection.json`, `${destDir}/collection.json`);
}

const srcDir = './src';
const destDir = './dist';

[copySchemas, copyCollection, copyFiles].map((f) => f(srcDir, destDir));
