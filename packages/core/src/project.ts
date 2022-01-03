import path from "path";
import { JSONFile } from "@nice/ts-template";

export const FRAMEWORK_FOLDER = `.fx`;
export const PROJECT_FILE_NAME = "project.json";

export type ResourceInstance<TInput = any, TOutput = any> = {
  type: string;
  input: TInput;
  output: TOutput; 
  id: string;
};

export type Project = {
  resources: ResourceInstance[];
};

export type ProjectLoadOptions =
  | {
      projectFile: string;
    }
  | { projectFolder: string };

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
