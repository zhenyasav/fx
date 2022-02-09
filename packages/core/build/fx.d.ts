import { ResourceInstance, LoadedResource, LoadedConfig } from "@fx/plugin";
import { ConfigLoaderOptions } from "./config";
export declare type FxOptions = ConfigLoaderOptions & {
    aadAppId?: string;
};
export declare class Fx {
    private options;
    private _config;
    private configLoader;
    constructor(options?: FxOptions);
    config(): Promise<LoadedConfig>;
    getResourcesWithMethod(methodName: string): Promise<LoadedResource[]>;
    invokeMethodOnAllResources(methodName: string): Promise<void>;
    invokeResourceMethod(resource: LoadedResource, methodName: string, options?: {
        dryRun: boolean;
        defaultArgs?: any;
    }): Promise<{
        effects: import("@fx/plugin").Effect.Any[] | never[];
        value: any;
        description: string;
    }>;
    createResource(type: string, inputs?: {
        name?: string;
    }, dryRun?: boolean): Promise<ResourceInstance<any>>;
}
