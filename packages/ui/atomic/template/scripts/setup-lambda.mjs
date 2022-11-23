import {symlinkSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function linkSearchTokenLambdaToRoot() {
  symlinkSync(
    resolve(__dirname, 'node_modules', '@coveo', 'search-token-lambda'),
    resolve(__dirname, 'lambda'),
    'junction'
  );
}

function main() {
  linkSearchTokenLambdaToRoot();
}

main();
