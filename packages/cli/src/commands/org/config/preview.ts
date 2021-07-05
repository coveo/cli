import {
  IsAuthenticated,
  Preconditions,
} from '../../../lib/decorators/preconditions';
import SnapshotBase from './orgConfigBase';

export default class Preview extends SnapshotBase {
  public static description = 'Preview resource updates';

  public static flags = {
    ...SnapshotBase.flags,
  };

  public static hidden = true;

  @Preconditions(IsAuthenticated())
  public async run() {
    const {reporter, snapshot, project} = await this.dryRun();

    await snapshot.preview();

    if (reporter.isSuccessReport()) {
      await snapshot.delete();
    }

    project.deleteTemporaryZipFile();
  }
}
