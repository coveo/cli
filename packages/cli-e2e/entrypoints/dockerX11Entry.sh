export DISPLAY=host.docker.internal:0.0

xdg-settings set default-web-browser google-chrome.desktop

npm install -g @angular/cli
npm install -g ts-node

rsync -r --exclude="node_modules" /home/notGroot/cli/* /home/notGroot/cli-copy/
cd /home/notGroot/cli-copy

npm run setup
npm run build

export UI_TEMPLATE_VERSION=0.0.0
npm set registry http://verdaccio:4873
yarn config set registry http://verdaccio:4873
ts-node --transpile-only ./packages/cli-e2e/utils/npmLogin.ts

npm run npm:bump:template -- -- $UI_TEMPLATE_VERSION

npm run npm:publish:template:local

google-chrome --no-first-run --remote-debugging-port=9222 --disable-dev-shm-usage --window-size=1080,720 >/dev/null 2>&1 & \

cd packages/cli-e2e
node entrypoints/utils/wait-for-published-packages.js
yarn config delete -- --mutex
export COVEO_CLI_E2E_DEBUG=true;

# Wait for Chrome to be up'n'running.
while ! timeout 1 bash -c "echo > /dev/tcp/localhost/9222"; do sleep 10; done

npm run-script jest:debug
