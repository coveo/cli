import {writeJsonSync} from 'fs-extra';
import snapshotTemplate from './templates/snapshot-template.json';
import snapshotGroupingTemplate from './templates/snapshot-grouping-template.json';

const SnashotVariationPlaceholder = [
  'objectType',
  'catalogId',
  'groupingId',
] as const;

type Placeholder = typeof SnashotVariationPlaceholder[number];

export type SnashotVariations = Partial<Record<Placeholder, string>>;

export class SnapshotTemplate {
  private template: string;
  public constructor(private variations: SnashotVariations) {
    this.template = JSON.stringify(
      this.variations.groupingId ? snapshotGroupingTemplate : snapshotTemplate
    );
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
