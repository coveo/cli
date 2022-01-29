declare module 'conventional-changelog-angular' {
  import type {Commit} from 'conventional-commits-parser';

  interface RecommendedBumpOptions {
    parserOpts: ParserOpts;
    whatBump: WhatBumpFunction;
  }
  type ParserOpts = unknown;
  type WhatBumpFunction = (commits: Array<Commit>) => {
    level: 0 | 1 | 2;
    reason: string;
  };
  interface ConventionalChangelogPackage {
    conventionalChangelog: unknown;
    parserOpts: unknown;
    recommendedBumpOpts: RecommendedBumpOptions;
    writerOpts: unknown;
  }
  const package: Promise<ConventionalChangelogPackage>;
  export = package;
}
