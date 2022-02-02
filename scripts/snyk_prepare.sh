rsync -r -m --include=\"*/\" --include=\"package.json\" --exclude=\"*\" node_modules/ node_modules_bak
npm i --no-package-lock
rsync -r -m --existing --include=\"*/\" --include=\"package.json\" --exclude=\"*\" ../../node_modules .
rsync -r -m --existing --include=\"*/\" --include=\"package.json\" --exclude=\"*\" node_modules_bak/ node_modules
npm i --package-lock-only
rm -rf node_modules_bak