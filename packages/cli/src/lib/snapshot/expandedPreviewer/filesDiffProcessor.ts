import {ResourceSnapshotType} from '@coveord/platform-client';
import {readdirSync, existsSync} from 'fs';
import {readJSONSync, writeJSONSync} from 'fs-extra';
import {join} from 'path';

type ResourcesJSON = Object & {resourceName: string};

type SnapshotFileJSON = Object & {
  resources: Partial<{[key in ResourceSnapshotType]: ResourcesJSON[]}>;
};

export function recursiveDirectoryDiff(
  currentDir: string,
  previewDir: string,
  deleteMissingFile: boolean
): string[] {
  const files = readdirSync(previewDir, {withFileTypes: true});
  const filePaths: string[] = [];
  files.forEach((file) => {
    if (file.isDirectory()) {
      filePaths.push(
        ...recursiveDirectoryDiff(
          join(currentDir, file.name),
          previewDir,
          deleteMissingFile
        )
      );
    }

    if (file.isFile()) {
      const previewFile = readJSONSync(join(previewDir, file.name));
      const currentFilePath = join(currentDir, file.name);

      if (!existsSync(currentFilePath)) {
        writeJSONSync(join(currentDir, file.name), previewFile, {
          spaces: 2,
        });
        return;
      }

      const currentFile = readJSONSync(currentFilePath);

      const diffedJSON = buildDiffedJson(
        currentFile,
        previewFile,
        deleteMissingFile
      );

      writeJSONSync(join(currentDir, file.name), diffedJSON, {
        spaces: 2,
      });
    }
  });
  return filePaths;
}

function buildDiffedJson(
  currentFile: SnapshotFileJSON,
  previewFile: SnapshotFileJSON,
  deleteMissingFile: boolean
) {
  const currentResources = getResourceDictionnaryFromObject(currentFile);
  const previewResources = getResourceDictionnaryFromObject(previewFile);
  const diffedDictionnary = getDiffedDictionnary(
    currentResources,
    previewResources,
    deleteMissingFile
  );

  const diffedResources: ResourcesJSON[] = [];
  diffedDictionnary.forEach((resource) => diffedResources.push(resource));
  diffedResources.sort();

  const resourceType = Object.keys(currentFile.resources)[0];
  const diffedJSON: SnapshotFileJSON = {
    ...currentFile,
    resources: {[resourceType]: diffedResources},
  };
  return diffedJSON;
}

function getDiffedDictionnary(
  currentResources: Map<string, ResourcesJSON>,
  previewResources: Map<string, ResourcesJSON>,
  shouldDelete: boolean
) {
  if (shouldDelete) {
    return previewResources;
  }
  const diffedResources = new Map<string, ResourcesJSON>(currentResources);
  const iterator = previewResources.keys();
  for (
    let resource = iterator.next();
    !resource.done;
    resource = iterator.next()
  ) {
    const previewResource = previewResources.get(resource.value);
    if (previewResource) {
      diffedResources.set(resource.value, previewResource);
    }
  }
  return diffedResources;
}

function getResourceDictionnaryFromObject(snapshotFile: SnapshotFileJSON) {
  const dictionnary = new Map<string, ResourcesJSON>();
  const resourcesSection = snapshotFile.resources;
  for (const resourceType in resourcesSection) {
    const resources = resourcesSection[resourceType as ResourceSnapshotType];
    resources?.forEach((resource) => {
      dictionnary.set(resource.resourceName, resource);
    });
  }
  return dictionnary;
}
