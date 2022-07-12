import {SnapshotDiffModel} from '@coveord/platform-client';
import {CliUx} from '@oclif/core';
import axios from 'axios';
import {green} from 'chalk';
import {writeFileSync} from 'fs';
import {mkdirSync, Dirent, existsSync, readdirSync, rmSync} from 'fs-extra';
import {join} from 'path';
import {DotFolder} from '../../project/dotFolder';
import {Project} from '../../project/project';

export class SnapshotDiffReporter {
  private static readonly previewDirectoryName = 'preview';
  private static previewHistorySize = 1;
  // public constructor(private model: SnapshotDiffModel, projectPath: string) {}
  public constructor(
    private readonly report: SnapshotDiffModel,
    private readonly projectToPreview: Project
  ) {}

  private static get previewDirectory() {
    return join(
      DotFolder.hiddenFolderName,
      SnapshotDiffReporter.previewDirectoryName
    );
  }

  public async preview() {
    if (!this.hasChanges) {
      CliUx.ux.action.start('No diff to view');
      return;
    }

    if (existsSync(SnapshotDiffReporter.previewDirectory)) {
      this.deleteOldestPreviews();
    }
    const dirPath = join(
      SnapshotDiffReporter.previewDirectory,
      this.report.snapshotId
    );

    mkdirSync(dirPath, {
      recursive: true,
    });

    CliUx.ux.action.start('Downloading snapshot diff');
    for (const [resourceName, diffModel] of Object.entries(this.report.files)) {
      const diffFilePath = join(dirPath, `${resourceName}.patch`);
      await this.downloadDiff(diffFilePath, diffModel.url);
    }
    CliUx.ux.action.stop(green('✔'));
  }

  private async downloadDiff(downloadPath: string, url: string) {
    const {data} = await axios.get(url, {method: 'GET', responseType: 'blob'});
    writeFileSync(downloadPath, data);
  }

  private deleteOldestPreviews() {
    const getFilePath = (fileDirent: Dirent) =>
      join(SnapshotDiffReporter.previewDirectory, fileDirent.name);

    const allFiles = readdirSync(SnapshotDiffReporter.previewDirectory, {
      withFileTypes: true,
    });
    const dirs = allFiles.filter((potentialDir) => potentialDir.isDirectory());

    while (dirs.length >= SnapshotDiffReporter.previewHistorySize) {
      rmSync(getFilePath(dirs.shift()!), {
        recursive: true,
        force: true,
      });
    }
  }

  private get hasChanges() {
    return Object.keys(this.report.files).length >= 0;
  }
}

const download = async () => {
  // const url =
  //   'https://coveo-nprd-migration-service.s3.amazonaws.com/clivault11yqfl0x76/snapshot/clivault11yqfl0x76-xnqf7r3m2cmzpszs3pcdxv2bxe/snapshotdiff_QUERY_PARAMETER.json?response-content-disposition=attachment%3B%20filename%20%3D%22clivault11yqfl0x76-xnqf7r3m2cmzpszs3pcdxv2bxe_QUERY_PARAMETER.patch%22&X-Amz-Security-Token=FwoGZXIvYXdzED4aDK3K3X3%2FuBdDcHwq3iLNBF42oOKYcMaK8LP0T4i%2FlH5kNvDx75ey3IvSCBPqd%2FPLKXUuxRDvxFIICszMA%2Bb%2FivCpGFF68KQ1r7ZSaDddOvBRS0go7xYLDINLIMtMEvsgtiVbrsMhsgFU%2Fmpn9P7NA3Tc17yx1gDXrdjsRmrwBeoaMbH3neoORz1H5km0%2FgVOcGcXXCpWNfrYpY42nfoeMonnSam19MKdEtyuFlU%2BUHyN19BD1vyTcG%2F%2FJLJxjZuIRfuVMf4pXBOfeCO2x99NKvKZ9jCbpZB4sGV3%2F7gFCiLfmMMXt6mBpkQ9jdJ4F8PVrZth2%2FowVONyHj060tHgu61PtnML1tFbuYfdLw3rrhjzxnPUJcnfNCowO%2FksVOe2%2FMpSfpMEKV%2BaAK08LPCntLMUYCTbcCn9iaUqpnOPyehkYWuXPz4slsIkwBWlJ2o6%2FCPBhPoFHBDET5o%2BAng7kSWUSOgNTsPpLAO0oiA61wuheyZz0FetXkKZ9gmPAeweXE%2FRJRpzAdhIzMg2X6gR5%2BnDGmojrpDtaGp4OB1sdq1tZ4UIYaHCUgRFwcm9BkunRpWhfdcaGGpDvvqFAgLmAIdfT4sjUyRwIrY18XB3Dlyg6%2F2WrmQPd7n2y8ibRCjWYDNpQ8sXGCPx52Spz5aFyH%2Bu98QcBCxsWp2Q3MbW%2B2hqyvt8sCwDhwVbb3a%2FT71FbGJKidwqrUfqlw82mXZ8w%2F%2F5VH%2F%2FPCwXdTnZW9oI45vQQhFTCZzsXHE1iMszqAXNs8GlGfShmmTbW9zh2Cc9KNLHhIZZ4A8KpDAU%2BvQo%2BLe3lgYyK1PPd7oLiVgf4Sub6r5UEd9T9wbeLPHWg%2FKR1y6iX%2FlbTlqQRZPCHYo9X4c%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20220712T204538Z&X-Amz-SignedHeaders=host&X-Amz-Expires=21600&X-Amz-Credential=ASIAYKDJLZIT23WM3FVR%2F20220712%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=fe9cdcd5ec448142e1abb983ded77baa37d9c07b6a900f9d30cb10fe1d0e2863';

  const url =
    'https://coveo-nprd-migration-service.s3.amazonaws.com/clivault11yqfl0x76/snapshot/clivault11yqfl0x76-xnqf7r3m2cmzpszs3pcdxv2bxe/snapshotdiff_QUERY_PARAMETER.json?X-Amz-Security-Token=FwoGZXIvYXdzED4aDH9V%2F9lAAcAbgSP3RSLNBBnxhxQZteUGOSh5WdtixPGtL1ftK2P1p%2FdQcqCKmFL%2FBFcv4efh8onhRnTPoVNkzCQZHvVxhDaISdJboM8qfeEnbX2yWfpl5HrtdAFGcLLDGmWgO2ZQ%2BM9aNhztrQv%2BQTletVr6r5mB3%2F2BR5dV1Hnd6FOH151rNi5ute%2BsKIX8X8sqNGCT7hutNqGxgLX7YOk7w64Ux%2F6PHKKIIxuapfhFFQKtQXNWvjncBkRNs%2B%2BjX7Q%2BwmXtn%2Fu25GqMQwY87CkKEo%2F%2BBphCIIfRNfpCJdLfk9UdXU3HjJX04Gw7A0fZ4VJZ2srXBKJ4i8sfSqJ6iVl33lmK2GlyQ1PxSfFnZcDIsA6mMWWvubRZO5mIS%2B%2FUQ7GEj0rXcZEgxdrwB40dzRWVtKPVpNltI0Y3kYduHYeuMTHn2K9RLgBiX3Q%2FL6FO9FKOQKyLj7IOs2%2F0s8n3vEQwa1bIU1Mcna8l7QTC72ljwayGYDBKI6dlohu8vf8z11g%2FC7mepchTA3Nv0pw%2B5oRaZbr5vLMPj8LPdzD3gwgt%2BwEmXxzu%2F%2Fwi1cavGCQO4QhUf2PsTxjbjvwWW0SqdQidTY%2FvFg6QweHocXW6iVtZsogUbWFMrrIGnHnJ0rHKuXEcBNAUOsfAEMFbgKY7vzWGjeILDpZgKo7a%2BEH1UOhsCRmm4ZfUnjEVPqUH2PsetHIymAZcr6lb%2FGBZRllcNdW9fYlVTkmTy1bwCUSGzN7yK0OqhkDOYxr%2FSukaLVsF9PHrri%2FMI346BuwWJ8M2OnC0gwQ3vKn2YQR65fAo0Le3lgYyKzz72%2FcFqz%2FEkWLZxIxwU6TDj%2BNiP03P8RrnNx77z90dLsRyrCB%2Fg6oszFw%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20220712T204520Z&X-Amz-SignedHeaders=host&X-Amz-Expires=21600&X-Amz-Credential=ASIAYKDJLZITQDTEUX7L%2F20220712%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=1c967233ec5818bca7c6175c57c635882a3581835c0311995f544c8de0376b26';
  const {data} = await axios.get(url, {method: 'GET', responseType: 'blob'});
  writeFileSync('QUERY_PARAMETER.patch', data);
};

async function main() {
  await download();
}

main();
