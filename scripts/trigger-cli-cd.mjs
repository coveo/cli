import {context, getOctokit} from '@actions/github';

const octokit = getOctokit(process.env.GH_TOKEN);
const latestCommit = process.env.LATEST_COMMIT;

await octokit.rest.repos.createDispatchEvent({
  event_type: 'deploy',
  client_payload: {
    run_Id: context.runId,
    version: 'v3',
    latest_commit: latestCommit,
  },
  owner: 'coveo-platform',
  repo: 'cli-cd',
});
