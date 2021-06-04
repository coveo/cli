export class Snapshot {
  public constructor() {}

  public async push() {
    // TODO: CDX-356: Right now the snapshot will remain in the connected org. It should be sent to the destination org specified by the --target flag.
    // const snapshotClient = await this.getSnapshotClient();
    // snapshotClient.push(this.lastSnapshot?.targetId, {targetOrganisationId});
  }

  public validate() {
    // TODO: CDX-358: Validate snapshot
  }

  public preview() {
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

  public async delete() {
    // TODO: CDX-359: Delete snapshot once previewed
  }
}
