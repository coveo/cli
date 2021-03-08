export DISPLAY=host.docker.internal:0.0

xdg-settings set default-web-browser google-chrome.desktop

useradd -ms /bin/bash notGroot
rsync -r --exclude="node_modules" /home/cli/* /home/cli-copy
chmod -R 777 /home/cli-copy
cd /home/cli-copy

sudo -u notGroot npm run setup
cd packages/cli-e2e

mkdir dotenv
echo "process.env.PLATFORM_USER_NAME='$PLATFORM_USER_NAME'" > dotenv/config.ts
echo "process.env.PLATFORM_USER_PASSWORD='$PLATFORM_USER_PASSWORD'" >> dotenv/config.ts

sudo -u notGroot google-chrome --no-first-run --remote-debugging-port=9222 --disable-dev-shm-usage >/dev/null 2>&1 & \
sudo -u notGroot npm run-script jest:debug
