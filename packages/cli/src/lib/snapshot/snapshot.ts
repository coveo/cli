import {ResourceSnapshotsModel, PlatformClient} from '@coveord/platform-client';

export class Snapshot {
  constructor(
    private model: ResourceSnapshotsModel,
    private client: PlatformClient
  ) {}

  async validate() {
    // TODO: CDX-358: Validate snapshot
  }

  async preview() {
    // TODO: get detailed report
    this.displayLightPreview();
    this.displayExpandedPreview();
  }

  private displayLightPreview() {
    // TODO: CDX-346 Display light preview
  }

  private displayExpandedPreview() {
    // TODO: CDX-347 Display Expanded preview
  }

  async delete() {
    // TODO: CDX-359: Delete snapshot once previewed
  }
}
