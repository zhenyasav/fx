import { JSONFile } from "@nice/ts-template";
import { ResourceInstance } from "@fx/plugin";
export declare const FRAMEWORK_FOLDER = ".fx";
export declare const PROJECT_FILE_NAME = "project.json";
export declare type Project = {
    resources: ResourceInstance[];
};
export declare type ProjectLoadOptions = {
    projectFile: string;
} | {
    projectFolder: string;
};
export declare type ResourceReference = {
    $resource: string;
};
export declare function isResourceReference(o: any): o is ResourceReference;
export declare function getResourceReferences(object: any): ResourceReference[];
export declare function getPendingResourceReferences(object: any): ResourceReference[];
export declare class ProjectFile extends JSONFile<Project> {
    constructor(options: ProjectLoadOptions);
}
