const {execSync} = require('child_process');
const {DOCKER_CONTAINER_NAME} = require('./common');

execSync(`docker container rm ${DOCKER_CONTAINER_NAME} -f`);
