import { z } from "zod";
import { QuestionGenerator } from "@fx/zod-inquirer";
import { Effect } from "./effects";
import { MaybePromise } from "./promise";
import { JSONFile } from "@nice/file";
export declare type Plugin = {
    readonly name: string;
    resources(): MaybePromise<ResourceDefinition[]>;
};
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
    getResource(ref: ResourceReference): LoadedResource | null;
};
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
export declare class ProjectFile extends JSONFile<Project> {
    constructor(options: ProjectLoadOptions);
}
export declare type Typed = {
    type: string;
};
export declare type ResourceReference = {
    $resource: string;
};
export declare function isResourceReference(o: any): o is ResourceReference;
export declare function getResourceReferences(object: any): ResourceReference[];
export declare function getPendingResourceReferences(object: any): ResourceReference[];
export declare type MethodResult<TValue = any, TEffect extends Typed = Effect.Any> = void | {
    description?: string;
    value?: TValue;
    effects?: TEffect[];
};
export declare type MethodContext = {
    config: LoadedConfig;
    resource: LoadedResource;
};
export declare type Method<TInput = any, TOutput = any, TEffect extends Typed = Effect.Any> = {
    inputs?(context: {
        defaults?: Partial<TInput>;
        questionGenerator?: QuestionGenerator;
    } & MethodContext): MaybePromise<TInput>;
    body?(context: {
        input: TInput;
    } & MethodContext): MaybePromise<MethodResult<TOutput, TEffect>>;
};
export declare type Methods<TCreateInput = any> = {
    create?: Method<TCreateInput>;
} & {
    [methodName: string]: Method;
};
export declare type Transform<T, C = MethodContext> = (t: T, context: C) => {
    [k in keyof T]: any;
};
export declare function method<T extends z.ZodObject<z.ZodRawShape>>({ inputShape, inputTransform, ...rest }: {
    inputShape?: T;
    inputTransform?: Transform<z.infer<T>>;
} & Pick<Method<z.infer<T>>, "body">): Method<z.infer<T>>;
export declare type ResourceDefinition<TCreateInput = any> = {
    type: string;
    description?: string;
    methods?: Methods<TCreateInput>;
};
export declare function resourceId(instance: ResourceInstance): string;
export declare type ResourceInstance<TCreateArgs = any> = {
    id: string;
    type: string;
    inputs?: {
        create?: TCreateArgs;
    } & {
        [methodName: string]: any;
    };
    outputs?: any;
};
export declare type LoadedResource<TCreateInput = any> = {
    instance: ResourceInstance<TCreateInput>;
    definition?: ResourceDefinition<TCreateInput>;
};
