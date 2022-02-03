import { JSONFile } from "@nice/ts-template";
export declare const FRAMEWORK_FOLDER = ".fx";
export declare const PROJECT_FILE_NAME = "project.json";
export declare type ResourceInstance<TInput = any, TOutput = any> = {
    type: string;
    input: TInput;
    output?: TOutput;
    id: string;
};
export declare type Project = {
    resources: ResourceInstance[];
};
export declare type ProjectLoadOptions = {
    projectFile: string;
} | {
    projectFolder: string;
};
export declare class ProjectFile extends JSONFile<Project> {
    constructor(options: ProjectLoadOptions);
}
