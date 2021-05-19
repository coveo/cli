cd ../..

npm run setup
npm run build

export UI_TEMPLATE_VERSION=0.0.0
npm set registry http://localhost:4873
yarn config set  registry http://localhost:4873
yarn config set -- --mutex network
yarn config set -- --install.silent true
yarn config set -- --silent true

npm run npm:bump:template -- -- $UI_TEMPLATE_VERSION

npm run npm:publish:template

node scripts/wait-for-published-packages.js
  
cd packages/cli-e2e
