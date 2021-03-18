const core = require('@actions/core');
const github = require('@actions/github');
const tagRegExp = /refs\/tags\/(v[\d.]+)/;
const getTag = () => {
  if (github.context.eventName === 'workflow_dispatch') {
    return github.context.payload.inputs.version;
  }
  if (github.context.eventName === 'release') {
    const ref = github.context.ref;
    const match = tagRegExp.exec(ref);
    if (match && match[1]) {
      return match[1];
    }
  }
  throw 'Cannot determine tag!';
};

try {
  const tag = getTag();
  core.exportVariable('tag', tag);
} catch (error) {
  core.setFailed(error.message);
}
