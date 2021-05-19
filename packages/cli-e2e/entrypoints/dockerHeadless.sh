#!/bin/bash
cd ../..
pwd
sudo apt-get update
sudo apt-get install libssl-dev zlib1g-dev llvm libncurses5-dev libncursesw5-dev tk-dev

export DISPLAY=:1
Xvfb :1 -screen 0 1024x768x16 & sleep 1

xdg-settings set default-web-browser google-chrome.desktop

# rsync -r --exclude="node_modules" /home/notGroot/cli/* /home/notGroot/cli-copy/
# cd /home/notGroot/cli-copy

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

google-chrome --no-first-run --remote-debugging-port=9222 --disable-dev-shm-usage --window-size=1080,720 >/dev/null 2>&1 & \

node scripts/wait-for-published-packages.js
  
cd packages/cli-e2e

# Wait for Chrome to be up'n'running.
while ! timeout 1 bash -c "echo > /dev/tcp/localhost/9222"; do sleep 10; done

if npm run-script jest
then
    # sudo rsync -r /home/notGroot/cli-copy/packages/cli-e2e/artifacts/* /home/notGroot/cli/packages/cli-e2e/artifacts
    exit 0
else
    # sudo rsync -r /home/notGroot/cli-copy/packages/cli-e2e/artifacts/* /home/notGroot/cli/packages/cli-e2e/artifacts
    exit 1
fi
