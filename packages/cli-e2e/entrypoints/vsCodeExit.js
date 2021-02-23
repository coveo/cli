const {execSync} = require('child_process');

const DOCKER_CONTAINER_NAME = 'coveo-cli-e2e-container';
console.log('Doom guy is here');
execSync(`docker container rm ${DOCKER_CONTAINER_NAME}`);
console.log('Daemon BFGed');
