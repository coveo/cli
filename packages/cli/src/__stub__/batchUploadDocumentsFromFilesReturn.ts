import {DocumentBuilder} from '@coveo/push-api-client';
import {doMockAxiosError, doMockAxiosSuccess} from '../lib/push/testUtils';

export class BatchUploadDocumentsSuccess {
  public onBatchUpload(callback: Function) {
    callback({
      res: doMockAxiosSuccess(202, '👌'),
      batch: [
        new DocumentBuilder('somwhereintheinternet.com', 'Somewhere'),
        new DocumentBuilder('another.uri.com', 'The Title'),
      ],
      files: ['fileA', 'fileB'],
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
