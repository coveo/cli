import {green} from 'chalk';
import {UploadBatchCallbackData} from '@coveo/push-api-client';
import {errorMessage, successMessage} from './userFeedback';
import {Plurable, pluralizeIfNeeded} from '@coveo/cli-commons/utils/string';
import {CliUx} from '@oclif/core';
import {UploadProgress} from '@coveo/push-api-client/dist/definitions/interfaces';
import {logNewLine} from './addCommon';

export interface AddSummary {
  added: number;
  failed: number;
  remaining?: number;
  total?: number;
}

export class AddDisplay {
  private summary: AddSummary = {
    added: 0,
    failed: 0,
  };

  public successMessageOnAdd({
    batch,
    files,
    res,
    progress,
  }: UploadBatchCallbackData) {
    // Display the first 5 files (from the list of all files) being processed for end user feedback.
    // Don't want to clutter the output too much if the list is very long.
    let fileNames = files.slice(0, 5).join(', ');
    if (files.length > 5) {
      fileNames += ` and ${files.length - 5} more ...`;
    }
    const numAdded = batch.length;
    const plurableDoc: Plurable = ['document', 'documents'];
    successMessage(
      `Success: ${green(numAdded)} ${pluralizeIfNeeded(
        plurableDoc,
        numAdded
      )} accepted by the API from ${green(fileNames)}.`,
      res
    );

    this.refreshSummary(batch.length, 0, progress);
    // TODO: CDX-712 display progress bar if progress data is available
  }

  public errorMessageOnAdd(
    e: unknown,
    {batch, progress}: UploadBatchCallbackData
  ) {
    this.refreshSummary(0, batch.length, progress);
    errorMessage('Error while trying to add document.', e, {exit: true});
  }

  private refreshSummary(
    added: number,
    failed: number,
    progress?: UploadProgress
  ) {
    this.summary.added += added;
    this.summary.failed += failed;
    this.summary.remaining = progress?.remainingDocumentCount;
    this.summary.total = progress?.totalDocumentCount;
  }

  public printSummary() {
    const {added, failed, remaining, total} = this.summary;
    const pluralized = (docCount: number) =>
      pluralizeIfNeeded(['document', 'documents'], docCount);

    const formatCount = (count: number) => {
      return `${count}${total ? ['/', total].join('') : ''}`;
    };

    CliUx.ux.styledHeader('Push Summary');

    CliUx.ux.log(
      `${formatCount(added)} ${pluralized(added)} successfully sent to the API`
    );

    if (failed > 0) {
      CliUx.ux.log(
        `${formatCount(failed)} ${pluralized(failed)} failed to be sent`
      );
    }

    if (remaining > 0) {
      CliUx.ux.log(
        `${formatCount(remaining)} unprocessed ${pluralized(remaining)}`
      );
    }

    logNewLine();
  }
}
