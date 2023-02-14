#!/usr/bin/env node
import '@coveo/create-atomic-component-project';
import {dirname, resolve} from 'node:path';
import {
  cpSync,
  renameSync,
  unlinkSync,
  writeFileSync,
  readFileSync,
} from 'node:fs';
import {cwd} from 'node:process';
import {fileURLToPath} from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const templateRelativeDir = 'template';
const templateDirPath = resolve(__dirname, templateRelativeDir);

const camelize = (str) =>
  str
    .replace(/-(.)/g, (_, group) => group.toUpperCase())
    .replace(/^./, (match) => match.toUpperCase());

cpSync(templateDirPath, cwd(), {
  recursive: true,
});

let componentName = process.argv[2];
if (componentName) {
  if (!componentName?.includes('-')) {
    componentName = `atomic-${componentName}`;
  }

  const transformers = [
    {
      srcPath: 'src/components/sample-component',
      destPath: `src/components/${componentName}`,
    },
    {
      srcPath: `src/components/${componentName}/src/sample-component.tsx`,
      destPath: `src/components/${componentName}/src/${componentName}.tsx`,
      transform: (text) =>
        text
          .replaceAll(/sample-component/g, componentName)
          .replaceAll(/SampleComponent/g, camelize(componentName)),
    },
    {
      srcPath: `src/components/${componentName}/src/sample-component.css`,
      destPath: `src/components/${componentName}/src/${componentName}.css`,
    },
    {
      srcPath: `src/components/${componentName}/package.json`,
      destPath: `src/components/${componentName}/package.json`,
      transform: (text) =>
        text.replaceAll(/@coveo\/sample-component/g, componentName),
    },
  ];

  // TODO: Refactor the transformers processing in an utils package
  for (const transformer of transformers) {
    if (!transformer.srcPath) {
      continue;
    }
    if (!transformer.destPath) {
      unlinkSync(transformer.srcPath);
      continue;
    }

    renameSync(transformer.srcPath, transformer.destPath);
    if (transformer.transform) {
      writeFileSync(
        transformer.destPath,
        transformer.transform(readFileSync(transformer.destPath, 'utf8'))
      );
    }
  }
}
