import path from "path";
import { JSONFile } from "@nice/ts-template";
import { ResourceInstance } from "@fx/plugin";

export const FRAMEWORK_FOLDER = `.fx`;
export const PROJECT_FILE_NAME = "project.json";

export type Project = {
  resources: ResourceInstance[];
};

export type ProjectLoadOptions =
  | {
      projectFile: string;
    }
  | { projectFolder: string };

export type ResourceReference = {
  $resource: string;
};

export function isResourceReference(o: any): o is ResourceReference {
  return !!o && typeof o == "object" && "$resource" in o;
}

export function getResourceReferences(object: any) {
  return Object.values(object)?.filter(isResourceReference);
}

export function getPendingResourceReferences(object: any) {
  return getResourceReferences(object)?.filter(
    (ref) => !/:/.test(ref.$resource)
  );
}

export class ProjectFile extends JSONFile<Project> {
  constructor(options: ProjectLoadOptions) {
    const { projectFile, projectFolder } = {
      projectFolder: process.cwd(),
      projectFile: null,
      ...options,
    };
    const resolvedProjectFileName =
      projectFile ??
      path.resolve(projectFolder, FRAMEWORK_FOLDER, PROJECT_FILE_NAME);
    super({ path: resolvedProjectFileName });
  }
}
