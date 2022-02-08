import { Plugin, ResourceDefinition } from "@fx/plugin";
import { Project } from "./project";
import { ProjectFile } from "./project";
import { ResourceInstance } from ".";
export declare type Config = {
    plugins?: Plugin[];
};
export declare type LoadedResource = {
    instance: ResourceInstance;
    definition?: ResourceDefinition;
};
export declare type LoadedConfig = Config & {
    configFilePath: string;
    project: Project;
    projectFile: ProjectFile;
    getResourceDefinitions(): ResourceDefinition[];
    getResourceDefinition(type: string): ResourceDefinition | null;
    getResources(): LoadedResource[];
};
export declare type ConfigLoaderOptions = {
    cwd?: string;
    configFile?: string;
};
export declare class ConfigLoader {
    private cosmiconfig;
    load(options?: ConfigLoaderOptions): Promise<LoadedConfig>;
}
