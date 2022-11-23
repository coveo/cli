const {linkSync} = require('fs');
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
