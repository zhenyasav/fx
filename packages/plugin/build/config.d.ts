import { Plugin } from "./plugin";
import { ResourceDefinition, LoadedResource } from "./resources";
import { Project, ProjectFile } from "./project";
export declare type Config = {
    plugins?: Plugin[];
};
export declare type LoadedConfig = Config & {
    configFilePath: string;
    project: Project;
    projectFile: ProjectFile;
    getResourceDefinitions(): ResourceDefinition[];
    getResourceDefinition(type: string): ResourceDefinition | null;
    getResources(): LoadedResource[];
};
