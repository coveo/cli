import { spawnSync } from "node:child_process";

export default function (newVersion: string, PATH: string) {
  spawnSync(`npm`, ["version", newVersion, "--git-tag-version=false"], {
    cwd: PATH,
  });
}
