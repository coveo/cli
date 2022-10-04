import {DocumentBuilder} from '@coveo/push-api-client';
import {doMockAxiosError, doMockAxiosSuccess} from './axiosMocks';

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
      res: doMockAxiosSuccess(202, '👌'),
      batch: new Array(this.numberOfFiles)
        .fill(undefined)
        .map(this.getNewDocumentBuilder.bind(this)),
      files: new Array(this.numberOfFiles)
        .fill(undefined)
        .map(this.getNewFileName.bind(this)),
    });
    return this;
  }
  public onBatchError(_callback: Function) {
    return this;
  }
  public async batch() {}
}

export class BatchUploadDocumentsError {
  public onBatchUpload(_callback: Function) {
    return this;
  }
  public onBatchError(callback: Function) {
    callback(
      doMockAxiosError(
        412,
        'this is a bad request and you should feel bad',
        'BAD_REQUEST'
      )
    );
    return this;
  }
  public async batch() {}
}
