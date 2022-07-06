import {writeJsonSync} from 'fs-extra';
import {join} from 'path';

const SnashotVariationPlaceholder = {
  objectType: '{{objectType}}',
  catalogId: '{{catalogId}}',
  groupingId: '{{groupingId}}',
};

export type SnashotVariations = Partial<typeof SnashotVariationPlaceholder>;

export class SnapshotTemplate {
  private templatePath = join(__dirname, 'templates');
  private template: string;
  public constructor(private variations: SnashotVariations) {
    this.template = join(
      this.templatePath,
      this.variations.groupingId
        ? 'snapshot-grouping-template.json'
        : 'snapshot-template.json'
    );
  }

  public write(snapshotPath: string) {
    writeJsonSync(snapshotPath, this.snapshot, {spaces: 2});
  }

  private get snapshot(): {} {
    for (const placeholder of Object.keys(SnashotVariationPlaceholder)) {
      const replacementString =
        this.variations[
          placeholder as keyof typeof SnashotVariationPlaceholder
        ];
      if (replacementString) {
        this.template = this.template.replace(
          new RegExp(placeholder, 'gm'),
          replacementString
        );
      }
    }

    return JSON.parse(this.template);
  }
}
