import {green} from 'chalk';
import {UploadBatchCallbackData} from '@coveo/push-api-client';
import {errorMessage, successMessage} from './userFeedback';
import {Plurable, pluralizeIfNeeded} from '@coveo/cli-commons/utils/string';
import {CliUx} from '@oclif/core';
import {UploadProgress} from '@coveo/push-api-client/dist/definitions/interfaces';
import {ProgressBar} from './progressBar';

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
    progress,
  }: UploadBatchCallbackData) {
    const numAdded = batch.length;
    // TODO: maybe add files to set

    this.refreshSummary(numAdded, 0, progress);
    this.bar
      .ensureInitialization(numAdded, progress?.totalDocumentCount)
      .increment(numAdded);
  }

  public errorMessageOnAdd(
    e: unknown,
    {batch, progress}: UploadBatchCallbackData
  ) {
    this.refreshSummary(0, batch.length, progress);
    const message = errorMessage('Error while trying to add document.', e);
    this.bar
      .ensureInitialization(batch.length, progress?.totalDocumentCount)
      .increment(batch.length)
      .log(message);
    // TODO: bubble up the error to amplitude
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
    const {added, failed, remaining} = this.summary;
    const getRatioCount = (count: number) => {
      const {total} = this.summary;
      return `${count}${total ? ['/', total].join('') : ''}`;
    };
    const pluralized = (docCount: number) =>
      pluralizeIfNeeded(['document', 'documents'], docCount);

    CliUx.ux.styledHeader('Push Summary');

    CliUx.ux.log(
      `${getRatioCount(added)} ${pluralized(
        added
      )} successfully sent to the API`
    );

    if (failed > 0) {
      CliUx.ux.log(
        `${getRatioCount(failed)} ${pluralized(failed)} failed to be sent`
      );
    }

    if (remaining && remaining > 0) {
      CliUx.ux.log(
        `${getRatioCount(remaining)} unprocessed ${pluralized(remaining)}`
      );
    }

    // TODO: add files that were processed
    // Display the first 5 files (from the list of all files) being processed for end user feedback.
    // Don't want to clutter the output too much if the list is very long.
    // let fileNames = files.slice(0, 5).join(', ');
    // let fileNames = files.slice(0, 5).join(', ');
    // if (files.length > 5) {
    //   fileNames += ` and ${files.length - 5} more ...`;
    // }
  }
}
