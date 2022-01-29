export {default as angular} from 'conventional-changelog-angular';
export {default as getCommits} from './git/getCommits';
export {default as getLastTag} from './git/getLastGitTag';
export {default as gitPush} from './git/doGitPush';
export {default as gitCommit} from './git/doGitCommit';
export {default as gitTag} from './git/doGitTag';
export {default as npmBumpVersion} from './npm/doNpmBumpVersion';
export {default as npmPublish} from './npm/doNpmPublish';
export {default as writeChangelog} from './changelog/doWriteChangelog';
export {default as generateChangelog} from './changelog/getChangelog';
export {default as getNextVersion} from './version/getNextVersion';
export {default as getCurrentVersion} from './version/getCurrentVersion';
export {default as parseCommits} from './semantic/getParsedCommits';

/*
let awaitedangular = await angular;

const PATH = "."; // Will be a param
const prefix = "v";
const lastTag =
  getLastTag(prefix) || "c8d337b6477761afe97d66e18bee62b5e889019a"; //Initial commit for demo purpose
const commits = getCommits(PATH, lastTag);
const parsedCommits = parseCommits(commits, awaitedangular.parserOpts);
const bumpInfo = awaitedangular.recommendedBumpOpts.whatBump(parsedCommits);
const currentVersion = getCurrentVersion(PATH);
const newVersion = getNextVersion(currentVersion, bumpInfo);
const changelog = await generateChangelog(
  parsedCommits,
  newVersion,
  {
    host: "https://github.com",
    owner: "coveo",
    repository: "cli",
  },
  awaitedangular.writerOpts
);
await writeChangelog(PATH, changelog);
npmBumpVersion(newVersion, PATH);
gitCommit(`chore(release): Release ${prefix}${newVersion} [skip ci]`, PATH);
gitTag(newVersion, prefix);
/* Done, but unwise to run here
 * TODO: Dry run for demo?
gitPush();
npmPublish(PATH);
*/
// gitCreateRelease(); //Can be discussions.
//console.log(`${currentVersion}->${newVersion}`);
