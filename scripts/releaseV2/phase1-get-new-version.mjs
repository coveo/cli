import {writeFileSync} from 'fs';

// Get all commits since last release bump the root package.json version.
(async () => {
  writeFileSync('.git-message', '');
})();
