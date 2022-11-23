const {symlinkSync} = require('fs');
const {resolve} = require('path');
function linkSearchTokenLambdaToRoot() {
  symlinkSync(
    resolve('node_modules', '@coveo', 'search-token-lambda'),
    resolve('lambda'),
    'junction'
  );
}

function main() {
  linkSearchTokenLambdaToRoot();
}

main();
