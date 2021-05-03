export DISPLAY=host.docker.internal:0.0

xdg-settings set default-web-browser google-chrome.desktop

rsync -r --exclude="node_modules" /home/notGroot/cli/* /home/notGroot/cli-copy/
cd /home/notGroot/cli-copy

npm run setup
npm run build

export UI_TEMPLATE_VERSION=0.0.0
npm set registry http://verdaccio:4873
yarn config set registry http://verdaccio:4873

npm run npm:bump:template -- -- $UI_TEMPLATE_VERSION

npm run npm:publish:template

google-chrome --no-first-run --remote-debugging-port=9222 --disable-dev-shm-usage --window-size=1080,720 --auto-open-devtools-for-tabs >/dev/null 2>&1 & \

node scripts/wait-for-published-packages.js

cd packages/cli-e2e
npm run-script jest:debug
