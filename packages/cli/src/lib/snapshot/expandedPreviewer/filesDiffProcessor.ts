import type {ResourceSnapshotType} from '@coveord/platform-client';
import {readdirSync, rmSync} from 'fs';
import {
  readJsonSync,
  readJSONSync,
  writeJSONSync,
  WriteOptions,
} from 'fs-extra';
import path, {isAbsolute, join} from 'path';

type ResourcesJSON = Object & {resourceName: string};

type SnapshotFileJSON = Object & {
  resources: Partial<{[key in ResourceSnapshotType]: ResourcesJSON[]}>;
};

const firstDirOfPath =
  process.platform === 'win32' ? /^[^\\]*(?=\\)/m : /^[^/]*\//m;
const defaultWriteOptions: WriteOptions = {spaces: 2};

export function recursiveDirectoryDiff(
  currentDir: string,
  nextDir: string,
  deleteMissingResources: boolean
) {
  if (!isAbsolute(currentDir) || !isAbsolute(nextDir)) {
    throw new Error('TODO: Some kind of error');
  }

  const currentFilePaths = getAllFilesPath(currentDir);
  const nextFilePaths = getAllFilesPath(nextDir);

  nextFilePaths.forEach((filePath) => {
    const nextFileJson = readJsonSync(join(nextDir, filePath));
    let dataToWrite = nextFileJson;
    if (currentFilePaths.has(filePath)) {
      currentFilePaths.delete(filePath);
      const currentFileJSON = readJSONSync(join(currentDir, filePath));
      dataToWrite = buildDiffedJson(
        currentFileJSON,
        nextFileJson,
        deleteMissingResources
      );
    }
    writeJSONSync(join(currentDir, filePath), dataToWrite, defaultWriteOptions);
  });

  if (deleteMissingResources) {
    currentFilePaths.forEach((filePath) => rmSync(join(currentDir, filePath)));
  }
}

function getAllFilesPath(
  currentDir: string,
  filePaths: Set<string> = new Set<string>()
) {
  const files = readdirSync(currentDir, {withFileTypes: true});
  files.forEach((file) => {
    if (file.isDirectory()) {
      getAllFilesPath(join(currentDir, file.name), filePaths);
    } else {
      filePaths.add(file.name.replace(firstDirOfPath, ''));
    }
  });
  return filePaths;
}

function buildDiffedJson(
  currentFile: SnapshotFileJSON,
  nextFile: SnapshotFileJSON,
  deleteMissingResources: boolean
) {
  const currentResources = getResourceDictionnaryFromObject(currentFile);
  const nextResources = getResourceDictionnaryFromObject(nextFile);
  const diffedDictionnary = getDiffedDictionnary(
    currentResources,
    nextResources,
    deleteMissingResources
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
