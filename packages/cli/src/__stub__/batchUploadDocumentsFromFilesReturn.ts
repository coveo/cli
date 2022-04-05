import {DocumentBuilder} from '@coveo/push-api-client';
import {doMockAxiosError, doMockAxiosSuccess} from '../lib/push/testUtils';

export class BatchUploadDocumentsSuccess {
  onBatchUpload(callback: Function) {
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
  onBatchError(_callback: Function) {
    return this;
  }
  async batch() {}
}

export class BatchUploadDocumentsError {
  onBatchUpload(_callback: Function) {
    return this;
  }
  onBatchError(callback: Function) {
    callback(
      doMockAxiosError(
        412,
        'this is a bad request and you should feel bad',
        'BAD_REQUEST'
      )
    );
    return this;
  }
  async batch() {}
}
