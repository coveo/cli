#!/bin/bash
set -e

sudo apt-get update
sudo apt-get install libssl-dev zlib1g-dev llvm libncurses5-dev libncursesw5-dev tk-dev

export DISPLAY=:1
Xvfb :1 -screen 0 1024x768x16 & sleep 1
google-chrome --no-first-run --remote-debugging-port=9222 --disable-dev-shm-usage --window-size=1080,720 >/dev/null 2>&1 &

xdg-settings set default-web-browser google-chrome.desktop
# TODO CDX-672 remove version lock
npm install -g @angular/cli@12.x
npm install -g ts-node

tmp_registry_log=`mktemp`
mkdir -p "$GITHUB_WORKSPACE/packages/cli-e2e/docker/config/verdaccio/storage"
touch "$GITHUB_WORKSPACE/packages/cli-e2e/docker/config/verdaccio/storage/htpasswd"
npx verdaccio --config "$GITHUB_WORKSPACE/packages/cli-e2e/docker/config/config.yaml" &>$tmp_registry_log & 

git config --global user.name "notgroot"
git config --global user.email "notgroot@coveo.com"

grep -q 'http address' <(tail -f $tmp_registry_log)

export UI_TEMPLATE_VERSION=0.0.0
npm config set registry http://localhost:4873
ts-node --transpile-only ./packages/cli-e2e/utils/npmLogin.ts
yarn config set  registry http://localhost:4873
yarn config set -- --mutex network
yarn config set -- --install.silent true
yarn config set -- --silent true
cat $tmp_registry_log
npm run npm:bump:template -- -- $UI_TEMPLATE_VERSION
npm run npm:publish:template
cd packages/cli-e2e
node entrypoints/utils/wait-for-published-packages.js

while ! timeout 1 bash -c "echo > /dev/tcp/localhost/9222"; do sleep 10; done
yarn config delete -- --mutex
npm run jest
