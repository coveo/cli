console.log(
  require("child_process")
    .spawnSync("git", ["describe", "--tags", "--abbrev=0", '--match=@coveo/angular*'])
    .output.toString()
);

// git ["describe", "--tags", "--abbrev=0", '--match="v*"