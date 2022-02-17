import {readFileSync, writeFileSync} from 'fs';
import {resolve, dirname} from 'path';
import detectIndent from 'detect-indent';
import {fileURLToPath} from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const pkgRaw = readFileSync(
  resolve(__dirname, '..', 'template', 'package.json'),
  'utf-8'
);
const pkgIndent = detectIndent(pkgRaw).indent || '\t';
const pkgJson = JSON.parse(pkgRaw);

pkgJson.name = '{{project}}';
pkgJson.version = '0.1.0';
pkgJson.scripts.postinstall = 'npm run setup-lambda && npm run setup-cleanup';
delete pkgJson.scripts['release:phase2'];

writeFileSync(
  resolve(__dirname, '..', 'template', 'package.json.hbs'),
  JSON.stringify(pkgJson, undefined, pkgIndent)
);
