const {symlinkSync} = require('fs');
const {resolve} = require('path');
function linSearchTokenLambdaToRoot() {
  symlinkSync(
    resolve('node_modules', '@coveo', 'search-token-lambda'),
    resolve('lambda'),
    'junction'
  );
}

function main() {
  linSearchTokenLambdaToRoot();
}

main();
