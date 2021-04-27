const core = require('@actions/core');
const {readFileSync} = require('fs');

(async () => {
  try {
    const tag = JSON.parse(readFileSync('lerna.json', 'utf8'))['version'];
    core.exportVariable('tag', tag);
  } catch (error) {
    core.setFailed(error.message);
  }
})();
