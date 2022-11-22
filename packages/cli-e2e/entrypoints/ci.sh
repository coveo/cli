#!/bin/bash
set -e


echo "::group::Setup Chrome"
brew install defaultbrowser
osascript ./macos-yes.scpt "chrome"
Xvfb :1 -screen 0 1024x768x16 & sleep 1
xdg-settings set default-web-browser google-chrome.desktop
echo "::endgroup::"

echo "::group::Install NPM Global dependencies"
npm install -g @angular/cli@15.x
npm install -g ts-node
echo "::endgroup::"

echo "::group::Setup Git User"
git config --global user.name "notgroot"
git config --global user.email "notgroot@coveo.com"
echo "::endgroup::"
