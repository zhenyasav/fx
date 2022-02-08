import { z } from "zod";
import inquirer from "inquirer";
import { ResourceInstance } from "@fx/plugin";
import { ConfigLoaderOptions, LoadedConfig, LoadedResource } from "./config";
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
        effects: never[] | import("@fx/plugin").Effect.Any[];
        value: any;
        description: string;
    }>;
    createResource(type: string, inputs?: {
        name?: string;
    }, dryRun?: boolean): Promise<ResourceInstance<any, any> | undefined>;
    generateResourceChoiceQuestion(shape: z.ZodTypeAny, key: string | number): Promise<Partial<inquirer.DistinctQuestion<inquirer.Answers>> | undefined>;
}
