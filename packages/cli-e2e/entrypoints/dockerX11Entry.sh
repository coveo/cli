export DISPLAY=host.docker.internal:0.0

xdg-settings set default-web-browser google-chrome.desktop

rsync -r /home/notGroot/cli-cache/* /home/notGroot/cli-copy/
rsync -r --exclude="node_modules" --exclude=".testcache" /home/notGroot/cli/* /home/notGroot/cli-copy/
cd /home/notGroot/cli-copy

npm run setup
cd packages/cli-e2e
google-chrome --no-first-run --remote-debugging-port=9222 --disable-dev-shm-usage --window-size=1080,720 >/dev/null 2>&1 & \

npm run-script jest:debug

rsync -r /home/notGroot/cli-copy/* /home/notGroot/cli-cache/