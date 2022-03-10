import {readFileSync, writeFileSync} from 'fs';
import {resolve, dirname} from 'path';
import detectIndent from 'detect-indent';
import {fileURLToPath} from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const packageJson = readFileSync(
  resolve(__dirname, '..', 'template', 'package.json'),
  'utf-8'
);

const packageTemplate = readFileSync(
  resolve(__dirname, 'packageTemplate.json'),
  'utf-8'
);

const pkgIndent = detectIndent(packageTemplate).indent || '\t';
const finalPackageJsonTemplate = JSON.parse(packageTemplate);
const packageJsonObject = JSON.parse(packageJson);

finalPackageJsonTemplate.dependencies = packageJsonObject.dependencies;
finalPackageJsonTemplate.devDependencies = packageJsonObject.devDependencies;

writeFileSync(
  resolve(__dirname, '..', 'template', 'package.json.hbs'),
  JSON.stringify(finalPackageJsonTemplate, undefined, pkgIndent)
);
