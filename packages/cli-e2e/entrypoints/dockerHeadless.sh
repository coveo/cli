export DISPLAY=:1
Xvfb :1 -screen 0 1024x768x16 & sleep 1

xdg-settings set default-web-browser google-chrome.desktop

rsync -r --exclude="node_modules" /home/notGroot/cli/* /home/notGroot/cli-copy/
cd /home/notGroot/cli-copy

npm run setup
cd packages/cli-e2e
google-chrome --no-first-run --remote-debugging-port=9222 --disable-dev-shm-usage >/dev/null 2>&1 & \
npm run-script jest:debug
