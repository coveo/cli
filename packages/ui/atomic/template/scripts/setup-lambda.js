const {linkSync} = require('fs');
const {resolve} = require('path');
function linSearchTokenLambdaToRoot() {
  linkSync(
    resolve('node_modules', '@coveo', 'search-token-lambda'),
    resolve('lambda')
  );
}

function main() {
  linSearchTokenLambdaToRoot();
}

main();
