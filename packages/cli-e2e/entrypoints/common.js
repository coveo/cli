const {resolve} = require('path');
const {spawnSync, execFileSync} = require('child_process');
const {existsSync, mkdirSync, writeFileSync} = require('fs');

const DOCKER_IMAGE_NAME = 'coveo-cli-e2e-image';
const composeProjectName = 'coveo-cli-e2e';
const DOCKER_CONTAINER_NAME = 'coveo-cli-e2e-container';
const repoHostPath = resolve(__dirname, ...new Array(3).fill('..'));
const screenshotsHostPath = resolve(__dirname, '..', 'screenshots');
const dockerDirPath = resolve(repoHostPath, 'packages', 'cli-e2e', 'docker');
const composeFilePath = resolve(dockerDirPath, 'docker-compose.yml');

const dockerEntryPoint = () => {
  if (isBash()) {
    return '';
  }
  return resolve(
    __dirname,
    process.argv[2] === '--debug' ? 'dockerX11Entry.sh' : 'dockerHeadless.sh'
  ).replace(/\\/g, '/');
};
const isBash = () => process.argv[2] === '--bash';

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

const ensureDockerImageIsPresent = () => {
  if (!isImagePresent()) {
    console.log('Building docker image');
    execFileSync('docker', ['build', '-t', DOCKER_IMAGE_NAME, dockerDirPath], {
      stdio: 'ignore',
    });
  }
};

const createEnvFile = () => {
  const environmentVariables = [
    'PLATFORM_USER_NAME',
    'PLATFORM_USER_PASSWORD',
    'GITHUB_ACTION',
  ];

  if (existsSync('.env')) {
    return;
  }

  environmentVariables.forEach((env) =>
    console.log(`${env} ${process.env[env] ? '' : 'un'}defined`)
  );

  writeFileSync(
    '.env',
    environmentVariables
      .map((variable) => `${variable}=${process.env[variable]}`)
      .join('\n')
  );
};

const startDockerCompose = () => {
  createEnvFile();
  // mkdirSync(screenshotsHostPath, {recursive: true});
  // const execArray = [
  //   'docker-compose',
  //   '-f',
  //   composeFilePath,
  //   '-p',
  //   composeProjectName,
  //   'up',
  //   '--force-recreate',
  //   '-d',
  // ];
  // if (process.env.CI) {
  //   execArray.unshift('sudo');
  // }
  const execArray = [
    'npx',
    'verdaccio',
    '--config',
    resolve(__dirname, '..', 'docker', 'config', 'config.yaml'),
  ];
  return execFileSync(execArray.shift(), execArray, {
    stdio: ['inherit', 'inherit', 'inherit'],
  });
};

const startTestRunning = () => {
  const execArray = [
    // 'docker',
    // 'exec',
    // `-${process.argv[2] === '--bash' ? 'it' : 'i'}`,
    // DOCKER_CONTAINER_NAME,
    'bash',
    dockerEntryPoint(),
  ];
  if (process.env.CI) {
    execArray.unshift('sudo');
  }
  return execFileSync(execArray.shift(), execArray, {
    stdio: ['inherit', 'inherit', 'inherit'],
  });
};

const stopDockerContainers = () =>
  execFileSync(
    'docker-compose',
    ['-f', composeFilePath, '-p', composeProjectName, 'down'],
    {
      stdio: 'ignore',
    }
  );

module.exports = {
  DOCKER_CONTAINER_NAME,
  ensureDockerImageIsPresent,
  startDockerCompose,
  startTestRunning,
  stopDockerContainers,
};
