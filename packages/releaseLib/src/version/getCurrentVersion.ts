import semver from "semver";
import { join } from "node:path";
import { readFileSync } from "node:fs";

export default function (projectPath: string) {
  return semver.parse(
    JSON.parse(readFileSync(join(projectPath, "package.json")).toString())
      .version
  );
}
