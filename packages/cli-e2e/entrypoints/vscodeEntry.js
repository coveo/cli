const {
  ensureDockerImageIsPresent,
  startDockerContainer,
  cleanDockerContainer,
} = require('./common');

console.log('Test daemon spooling up');
ensureDockerImageIsPresent();

try {
  startDockerContainer();
} finally {
  cleanDockerContainer();
}
