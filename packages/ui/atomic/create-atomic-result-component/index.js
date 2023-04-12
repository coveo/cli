#!/usr/bin/env node
import {
  ensureComponentValidity,
  camelize,
  transform,
  successMessage,
} from '@coveo/create-atomic-commons';
import '@coveo/create-atomic-component-project';
import {dirname, resolve} from 'node:path';
import {cpSync} from 'node:fs';
import {cwd} from 'node:process';
import {fileURLToPath} from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const templateRelativeDir = 'template';
const templateDirPath = resolve(__dirname, templateRelativeDir);

cpSync(templateDirPath, cwd(), {
  recursive: true,
});
let componentName = process.argv[2];

if (componentName) {
  ensureComponentValidity(componentName);
  const transformers = [
    {
      srcPath: 'src/components/sample-result-component',
      destPath: `src/components/${componentName}`,
    },
    {
      srcPath: `src/components/${componentName}/src/sample-result-component.tsx`,
      destPath: `src/components/${componentName}/src/${componentName}.tsx`,
      transform: (text) =>
        text
          .replaceAll(/sample-result-component/g, componentName)
          .replaceAll(/SampleResultComponent/g, camelize(componentName)),
    },
    {
      srcPath: `src/components/${componentName}/src/sample-result-component.css`,
      destPath: `src/components/${componentName}/src/${componentName}.css`,
    },
    {
      srcPath: `src/components/${componentName}/package.json`,
      destPath: `src/components/${componentName}/package.json`,
      transform: (text) =>
        text.replaceAll(/(@coveo\/)?sample-result-component/g, componentName),
    },
  ];

  transform(transformers);
}

successMessage(componentName || 'sample-result-component');
