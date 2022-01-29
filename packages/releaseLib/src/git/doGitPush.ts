import { spawnSync } from "node:child_process";

export default function () {
  spawnSync("git", ["push", "--tags"]);
}
