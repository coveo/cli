export DISPLAY=:1
Xvfb :1 -screen 0 1024x768x16 & sleep 1

xdg-settings set default-web-browser google-chrome.desktop

useradd -ms /bin/bash notGroot
rsync -r --exclude="node_modules" /home/cli/* /home/cli-copy
chmod -R 777 /home/cli-copy
cd /home/cli-copy

sudo -u notGroot npm run setup
cd packages/cli-e2e
sudo -u notGroot google-chrome --no-first-run --remote-debugging-port=9222 --disable-dev-shm-usage >/dev/null 2>&1 & \
sudo -u notGroot npm run-script jest