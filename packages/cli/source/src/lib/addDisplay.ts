import {green, red} from 'chalk';
import {UploadBatchCallbackData} from '@coveo/push-api-client';
import {errorMessage, successMessage} from './userFeedback';
import {Plurable, pluralizeIfNeeded} from '@coveo/cli-commons/utils/string';
import {ProgressBar} from './progressBar';
import {CliUx} from '@oclif/core';
import {UploadProgress} from '@coveo/push-api-client/dist/definitions/interfaces';

export interface AddSummary {
  added: number;
  failed: number;
  remaining?: number;
  total?: number;
}

export class AddDisplay {
  private bar = new ProgressBar();
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
    const message = successMessage(
      `Success: ${green(numAdded)} ${pluralizeIfNeeded(
        plurableDoc,
        numAdded
      )} accepted by the API from ${green(fileNames)}.`,
      res
    );

    this.refreshSummary(batch.length, 0, progress);
    this.bar
      .ensureInitialization(numAdded, progress?.totalDocumentCount)
      .increment(numAdded)
      .log(message);
  }

  public errorMessageOnAdd(
    e: unknown,
    {batch, progress}: UploadBatchCallbackData
  ) {
    const numAdded = batch.length;
    const message = errorMessage('Error while trying to add document.', e);
    this.refreshSummary(0, numAdded, progress);
    this.bar.increment(numAdded).log(message);
    // TODO: find a way to bubble up the error
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

    CliUx.ux.styledHeader('Push Summary');

    CliUx.ux.log(
      `${added} ${green(pluralized(added))} successfully sent to the API`
    );

    if (failed > 0) {
      CliUx.ux.log(`${failed} ${red(pluralized(failed))} failed to be sent`);
    }
  }
}
