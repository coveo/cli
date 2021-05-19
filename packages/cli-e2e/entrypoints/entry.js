const {
  ensureDockerImageIsPresent,
  startDockerCompose,
  startTestRunning,
  stopDockerContainers,
} = require('./common');

// ensureDockerImageIsPresent();
try {
  startDockerCompose();
  // startTestRunning();
} finally {
  if (!process.env.CI) {
    // stopDockerContainers();
  }
}
