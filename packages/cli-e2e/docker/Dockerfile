FROM node:lts-buster

RUN wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add -
RUN sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list'
RUN apt-get update

RUN apt-get install -y google-chrome-stable
# RUN update-alternatives --set x-www-browser /usr/bin/google-chrome-stable

# Chrome deps
RUN apt-get install -yq libgconf-2-4
RUN apt-get install -y make build-essential libssl-dev zlib1g-dev   
RUN apt-get install -y libbz2-dev libreadline-dev libsqlite3-dev wget curl llvm 
RUN apt-get install -y libncurses5-dev libncursesw5-dev xz-utils tk-dev

# For headless without headless.
RUN apt-get install xvfb -y

# For Keytar see: https://github.com/atom/node-keytar#on-linux
RUN apt-get install -y libsecret-1-dev

# cp but better (need filtering abilities)
RUN apt-get install -y rsync
# sudo for running the test as not root while still being root.
RUN apt-get install -y sudo
