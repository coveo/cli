import {readFileSync, writeJsonSync} from 'fs-extra';
import {join} from 'path';

const SnashotVariationPlaceholder = [
  'objectType',
  'catalogId',
  'groupingId',
] as const;

type Placeholder = typeof SnashotVariationPlaceholder[number];

export type SnashotVariations = Partial<Record<Placeholder, string>>;

export class SnapshotTemplate {
  private basePath = join(__dirname, 'templates');
  private template: string;
  public constructor(private variations: SnashotVariations) {
    const templatePath = join(
      this.basePath,
      this.variations.groupingId
        ? 'snapshot-grouping-template.json'
        : 'snapshot-template.json'
    );

    this.template = readFileSync(templatePath).toString();
  }

  public write(snapshotPath: string) {
    writeJsonSync(snapshotPath, this.snapshot, {spaces: 2});
  }

  private get snapshot(): {} {
    for (const placeholder of SnashotVariationPlaceholder) {
      const replacementString = this.variations[placeholder];
      if (replacementString) {
        this.template = this.template.replace(
          new RegExp(`{{${placeholder}}}`, 'gmi'),
          replacementString
        );
      }
    }

    return JSON.parse(this.template);
  }
}
