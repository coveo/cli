import { spawnSync } from "node:child_process";

export default function (PATH: string) {
  spawnSync("npm", ["publish"], { cwd: PATH });
}
