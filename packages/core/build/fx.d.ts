import { ResourceDefinition } from "@fx/plugin";
import { ConfigLoaderOptions, LoadedConfig } from "./config";
export declare type FxOptions = ConfigLoaderOptions & {
    aadAppId?: string;
};
export declare class Fx {
    private options;
    private _config;
    private configLoader;
    constructor(options?: FxOptions);
    config(): Promise<LoadedConfig>;
    createResource(type: string, inputs?: {
        name?: string;
    }, dryRun?: boolean): Promise<void>;
    getResourceDefinitionsInProject(predicate?: (res: ResourceDefinition) => boolean): Promise<ResourceDefinition[]>;
    getResourcesInProjectWithMethod(methodName: string): Promise<ResourceDefinition[]>;
    invokeMethod(methodName: string, ...args: any[]): Promise<void>;
}
