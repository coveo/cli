import {
  IsAuthenticated,
  Preconditions,
} from '../../../lib/decorators/preconditions';
import OrgConfigBase from './orgConfigBase';

export default class Preview extends OrgConfigBase {
  public static description = 'Preview resource updates';

  public static flags = {
    ...OrgConfigBase.flags,
  };

  public static hidden = true;

  @Preconditions(IsAuthenticated())
  public async run() {
    const {isValid, snapshot, project} = await this.dryRun();

    await snapshot.preview();

    if (isValid) {
      await snapshot.delete();
    }

    project.deleteTemporaryZipFile();
  }
}
