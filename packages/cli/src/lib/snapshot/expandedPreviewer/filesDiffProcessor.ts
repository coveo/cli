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
  nextDir: string,
  deleteMissingFile: boolean
): string[] {
  const files = readdirSync(nextDir, {withFileTypes: true});
  const filePaths: string[] = [];
  files.forEach((file) => {
    if (file.isDirectory()) {
      filePaths.push(
        ...recursiveDirectoryDiff(
          join(currentDir, file.name),
          nextDir,
          deleteMissingFile
        )
      );
    }

    if (file.isFile()) {
      const nextFile = readJSONSync(join(nextDir, file.name));
      const currentFilePath = join(currentDir, file.name);

      if (!existsSync(currentFilePath)) {
        writeJSONSync(join(currentDir, file.name), nextFile, {
          spaces: 2,
        });
        return;
      }

      const currentFile = readJSONSync(currentFilePath);

      const diffedJSON = buildDiffedJson(
        currentFile,
        nextFile,
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
  nextFile: SnapshotFileJSON,
  deleteMissingFile: boolean
) {
  const currentResources = getResourceDictionnaryFromObject(currentFile);
  const nextResources = getResourceDictionnaryFromObject(nextFile);
  const diffedDictionnary = getDiffedDictionnary(
    currentResources,
    nextResources,
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
  nextResources: Map<string, ResourcesJSON>,
  shouldDelete: boolean
) {
  if (shouldDelete) {
    return nextResources;
  }
  const diffedResources = new Map<string, ResourcesJSON>(currentResources);
  const iterator = nextResources.keys();
  for (
    let resource = iterator.next();
    !resource.done;
    resource = iterator.next()
  ) {
    const nextResource = nextResources.get(resource.value);
    if (nextResource) {
      diffedResources.set(resource.value, nextResource);
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
