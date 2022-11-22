#!/bin/bash
set -e


echo "::group::Setup Chrome"
brew install defaultbrowser
osascript packages/cli-e2e/entrypoints/macos-yes.scpt "chrome"
sudo networksetup -setdnsservers Ethernet 9.9.9.9
echo "::endgroup::"

echo "::group::Install NPM Global dependencies"
npm install -g @angular/cli@15.x
npm install -g ts-node
echo "::endgroup::"

echo "::group::Setup Git User"
git config --global user.name "notgroot"
git config --global user.email "notgroot@coveo.com"
echo "::endgroup::"
