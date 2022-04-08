#!/bin/bash
set -e

echo "::group::System dependencies"
sudo apt-get update
sudo apt-get install libssl-dev zlib1g-dev llvm libncurses5-dev libncursesw5-dev tk-dev
echo "::endgroup::"

echo "::group::Setup Chrome"
Xvfb :1 -screen 0 1024x768x16 & sleep 1
xdg-settings set default-web-browser google-chrome.desktop
echo "::endgroup::"

echo "::group::Install NPM Global dependencies"
npm install -g @angular/cli@13.x
npm install -g ts-node
echo "::endgroup::"

echo "::group::Setup Git User"
git config --global user.name "notgroot"
git config --global user.email "notgroot@coveo.com"
echo "::endgroup::"
