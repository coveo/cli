const {
  ensureDockerImageIsPresent,
  startDockerCompose,
  // startTestRunning,
  // stopDockerContainers,
} = require('./utils/common');

// ensureDockerImageIsPresent();
try {
  startDockerCompose();
  // startTestRunning();
} finally {
  // stopDockerContainers();
}
