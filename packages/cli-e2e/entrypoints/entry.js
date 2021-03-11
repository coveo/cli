const {
  ensureDockerImageIsPresent,
  startDockerContainer,
  cleanDockerContainer,
} = require('./common');

ensureDockerImageIsPresent();
try {
  startDockerContainer();
} finally {
  if (!process.env.CI) {
    cleanDockerContainer();
  }
}
