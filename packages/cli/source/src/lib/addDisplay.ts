import {green, red} from 'chalk';
import {UploadBatchCallbackData} from '@coveo/push-api-client';
import {errorMessage, successMessage} from './userFeedback';
import {Plurable, pluralizeIfNeeded} from '@coveo/cli-commons/utils/string';
import {ProgressBar} from './progressBar';
import {CliUx} from '@oclif/core';

export interface AddSummary {
  added: number;
  failed: number;
  remaining?: number;
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

    this.summary.added += numAdded;
    this.summary.remaining = progress?.remainingDocumentCount;
    this.bar
      .ensureInitialization(numAdded, progress?.totalDocumentCount)
      .increment(numAdded)
      .log(message);
  }

  public errorMessageOnAdd(
    e: unknown,
    {batch, progress}: UploadBatchCallbackData
  ) {
    this.summary.failed += batch.length;
    this.summary.remaining = progress?.remainingDocumentCount;
    errorMessage('Error while trying to add document.', e, {
      exit: true,
    });
  }

  public printSummary() {
    const {added, failed, remaining} = this.summary;
    CliUx.ux.styledHeader('Push Summary');

    const pluralized = (docCount: number) =>
      `${docCount} ${pluralizeIfNeeded(['document', 'documents'], docCount)}`;

    CliUx.ux.log(`${green(pluralized(added))} successfully sent to the API`);

    if (failed > 0) {
      CliUx.ux.log(); // TODO: rephrase
      `${red(pluralized(failed))} failed to upload because of an error`;
    }

    if (remaining && remaining > 0) {
      CliUx.ux.log(`${red(pluralized(remaining))} unprocessed documents`);
    }
  }
}
