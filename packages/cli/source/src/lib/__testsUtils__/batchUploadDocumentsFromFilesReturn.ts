import {DocumentBuilder} from '@coveo/push-api-client';

export class BatchUploadDocumentsSuccess {
  constructor(private numberOfFiles: number = 2) {}
  private internalFakeFileCount: number = 0;
  private internalFakeBuilderCounter: number = 0;

  private get fakeFileCounter() {
    return this.internalFakeFileCount++;
  }

  private get fakeBuilderCounter() {
    return this.internalFakeBuilderCounter++;
  }

  private getNewFileName(): string {
    return `filename${this.fakeFileCounter}`;
  }

  private getNewDocumentBuilder(): DocumentBuilder {
    const number = this.fakeBuilderCounter;
    return new DocumentBuilder(`https://foo${number}.bar`, `somedoc${number}`);
  }

  public onBatchUpload(callback: Function) {
    callback({
      res: {status: 202, statusText: '👌'},
      batch: new Array(this.numberOfFiles)
        .fill(undefined)
        .map(this.getNewDocumentBuilder.bind(this)),
      files: new Array(this.numberOfFiles)
        .fill(undefined)
        .map(this.getNewFileName.bind(this)),
      progress: {
        remainingDocumentCount: 0,
        totalDocumentCount: this.numberOfFiles,
      },
    });
    return this;
  }
  public onBatchError(_callback: Function) {
    return this;
  }
  public async batch() {}
}

export class BatchUploadDocumentsError {
  constructor(
    private totalDocumentCount: number = 10,
    private failedDocumentCount: number = 2
  ) {}

  public onBatchUpload(_callback: Function) {
    return this;
  }
  public onBatchError(callback: Function) {
    callback(
      {
        status: 412,
        title: 'BAD_REQUEST',
        detail: 'this is a bad request and you should feel bad',
      },
      {
        batch: new Array(this.failedDocumentCount),
        progress: {
          remainingDocumentCount: this.remainingDocumentCount,
          totalDocumentCount: this.totalDocumentCount,
        },
      }
    );
    return this;
  }
  public async batch() {}
  private get remainingDocumentCount() {
    return this.totalDocumentCount - this.failedDocumentCount;
  }
}
