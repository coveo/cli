import {
  ProjectDefinition,
  WorkspaceDefinition,
} from '@schematics/angular/utility/workspace';

export const getProjectFromWorkspace = (
  workspace: WorkspaceDefinition,
  projectName?: string
): ProjectDefinition => {
  if (projectName) {
    const project = workspace.projects.get(projectName);
    if (!project) {
      throw new Error(`Project "${projectName}" was not found in workspace.`);
    }
    return project;
  }

  const firstProject = workspace.projects.entries().next().value?.[1];
  if (!firstProject) {
    throw new Error('No project was found in workspace.');
  }

  return firstProject;
};
