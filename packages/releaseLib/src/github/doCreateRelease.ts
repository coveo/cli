import type {Octokit} from 'octokit';

export default function (
  octokit: Octokit,
  changelog: string,
  tag: string,
  repoOwner: string,
  repo: string
) {
  return octokit.rest.repos.createRelease({
    owner: repoOwner,
    repo: repo,
    body: changelog,
    tag_name: tag,
  });
}
