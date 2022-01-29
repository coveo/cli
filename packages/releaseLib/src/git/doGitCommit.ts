import { spawnSync } from "node:child_process";

export default function (message: string, PATH: string) {
  spawnSync("git", ["add", PATH]);
  spawnSync("git", ["commit", "-m", message]);
}
