#!/bin/bash

export DISPLAY=:1
Xvfb :1 -screen 0 1024x768x16 & sleep 1

xdg-settings set default-web-browser google-chrome.desktop

npm install -g @angular/cli

rsync -r --exclude="node_modules" /home/notGroot/cli/* /home/notGroot/cli-copy/
cd /home/notGroot/cli-copy

npm i
npm run build
npm set registry http://verdaccio:4873
yarn config set  registry http://verdaccio:4873
yarn config set -- --mutex network
yarn config set -- --install.silent true
yarn config set -- --silent true


npm run npm:publish:template

google-chrome --no-first-run --remote-debugging-port=9222 --disable-dev-shm-usage --window-size=1080,720 >/dev/null 2>&1 & \


cd packages/cli-e2e
node entrypoints/utils/wait-for-published-packages.js

# Wait for Chrome to be up'n'running.
while ! timeout 1 bash -c "echo > /dev/tcp/localhost/9222"; do sleep 10; done

if npm run-script jest
then
    echo "Docker!" | sudo -S rsync -r /home/notGroot/cli-copy/packages/cli-e2e/artifacts/* /home/notGroot/cli/packages/cli-e2e/artifacts
    exit 0
else
    echo "Docker!" | sudo -S rsync -r /home/notGroot/cli-copy/packages/cli-e2e/artifacts/* /home/notGroot/cli/packages/cli-e2e/artifacts
    exit 1
fi
