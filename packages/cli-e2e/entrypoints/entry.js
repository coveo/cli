const {writeFileSync, existsSync} = require('fs');
const {resolve, join} = require('path');
const {execSync, spawnSync} = require('child_process');

const DOCKER_IMAGE_NAME = 'coveo-cli-e2e-image';
const DOCKER_CONTAINER_NAME = 'coveo-cli-e2e-container';
const repoHostPath = resolve(__dirname, ...new Array(3).fill('..'));
const repoDockerPath = '/home/notGroot/cli';
const dockerEntryPoint = (() => {
  if (isBash()) {
    return '/bin/bash';
  }
  return join(
    repoDockerPath,
    'packages',
    'cli-e2e',
    'entrypoints',
    process.argv[2] === '--debug' ? 'dockerX11Entry.sh' : 'dockerHeadless.sh'
  ).replace(/\\/g, '/');
})();
const dockerFilePath = resolve(repoHostPath, 'packages', 'cli-e2e', 'docker');

const noSuchImage = (message) =>
  message.trim().startsWith('Error: No such image:');

const isImagePresent = () => {
  const imageInspect = spawnSync('docker', [
    'image',
    'inspect',
    DOCKER_IMAGE_NAME,
  ]);

  if (imageInspect.error) {
    if (noSuchImage(imageInspect.error.toString())) {
      return false;
    }
    throw imageInspect.error;
  }
  const trimmedStderr = imageInspect.stderr.toString().trim();
  if (trimmedStderr) {
    if (noSuchImage(trimmedStderr)) {
      return false;
    }
    throw new Error(imageInspect.stderr.toString());
  }

  return true;
};

if (!isImagePresent()) {
  console.log('Building docker image');
  execSync(`docker build -t ${DOCKER_IMAGE_NAME} ${dockerFilePath}`, {
    stdio: 'ignore',
  });
}
try {
  createEnvFile();
  execSync(
    `docker run --name=${DOCKER_CONTAINER_NAME} -v "${repoHostPath}:${repoDockerPath}" -p "9229:9229" -${
      process.argv[2] === '--bash' ? 'it' : 'i'
    } --env-file .env --cap-add=IPC_LOCK --cap-add=SYS_ADMIN ${DOCKER_IMAGE_NAME} ${dockerEntryPoint}`,
    {stdio: ['inherit', 'inherit', 'inherit']}
  );
} finally {
  if (!process.env.CI) {
    execSync(`docker container rm ${DOCKER_CONTAINER_NAME}`, {
      stdio: 'ignore',
    });
  }
}

createEnvFile();
function isBash() {
  return process.argv[2] === '--bash';
}

function createEnvFile() {
  const credentials = ['PLATFORM_USER_NAME', 'PLATFORM_USER_PASSWORD'];

  if (existsSync('.env')) {
    return;
  }

  writeFileSync(
    '.env',
    credentials
      .map((variable) => `${variable}=${process.env[variable]}`)
      .join('\n')
  );
}
