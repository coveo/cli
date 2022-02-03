#!/bin/bash
set -e

echo "::group::System dependencies"
brew install mitmproxy
sudo apt-get update
sudo apt-get install libssl-dev zlib1g-dev llvm libncurses5-dev libncursesw5-dev tk-dev
echo "::endgroup::"

echo "::group::Setup and start Chrome"
export DISPLAY=:1
Xvfb :1 -screen 0 1024x768x16 & sleep 1
google-chrome --no-first-run --remote-debugging-port=9222 --disable-dev-shm-usage --window-size=1080,720 >/dev/null 2>&1 &
xdg-settings set default-web-browser google-chrome.desktop
echo "::endgroup::"

echo "::group::Install NPM Global dependencies"
npm install -g @angular/cli@13.x
npm install -g ts-node
echo "::endgroup::"

echo "::group::Setup Verdaccio"
tmp_registry_log=`mktemp`
mkdir -p "$GITHUB_WORKSPACE/packages/cli-e2e/docker/config/verdaccio/storage"
touch "$GITHUB_WORKSPACE/packages/cli-e2e/docker/config/verdaccio/storage/htpasswd"
npx verdaccio --config "$GITHUB_WORKSPACE/packages/cli-e2e/docker/config/config.yaml" &>$tmp_registry_log & 
grep -q 'http address' <(tail -f $tmp_registry_log)
echo "::endgroup::"

git config --global user.name "notgroot"
git config --global user.email "notgroot@coveo.com"

echo "::group::Publishing UI templates"
npm config set registry http://localhost:4873
ts-node --transpile-only ./packages/cli-e2e/utils/npmLogin.ts
yarn config set  npmPublishRegistry http://localhost:4873
cat $tmp_registry_log
npm run npm:publish:template
cd packages/cli-e2e
node entrypoints/utils/wait-for-published-packages.js
echo "::endgroup::"

# Wait for Chrome to be up and running
while ! timeout 1 bash -c "echo > /dev/tcp/localhost/9222"; do sleep 10; done

echo "::group::Run tests"
npm run jest
echo "::endgroup::"
