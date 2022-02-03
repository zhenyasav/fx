import { Plugin, ResourceDefinition } from "@fx/plugin";
import { Project } from "./project";
import { ProjectFile } from ".";
export declare type Config = {
    plugins?: Plugin[];
};
export declare type LoadedConfig = Config & {
    configFilePath: string;
    project: Project;
    projectFile: ProjectFile;
    getResourceDefinitionByType(type: string): ResourceDefinition | null;
    getAllResourceDefinitions(): ResourceDefinition[];
};
export declare type ConfigLoaderOptions = {
    cwd?: string;
    configFile?: string;
};
export declare class ConfigLoader {
    private cosmiconfig;
    load(options?: ConfigLoaderOptions): Promise<LoadedConfig>;
}
