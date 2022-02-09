import { z } from "zod";
import { QuestionGenerator } from "@fx/zod-inquirer";
import { Effect } from "./effects";
import { MaybePromise } from "./promise";
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
export declare type Method<TInput = any, TOutput = any, TEffect extends Typed = Effect.Any> = {
    inputs?(context?: {
        defaults?: Partial<TInput>;
        questionGenerator?: QuestionGenerator;
    }): MaybePromise<TInput>;
    body?(context: {
        input: TInput;
        resource: LoadedResource;
    }): MaybePromise<MethodResult<TOutput, TEffect>>;
};
export declare type Methods<TCreateInput = any> = {
    create?: Method<TCreateInput>;
} & {
    [methodName: string]: Method;
};
export declare function method<T extends z.ZodObject<z.ZodRawShape>>({ inputShape, inputTransform, ...rest }: {
    inputShape?: T;
    inputTransform?: (t: Partial<T>) => {
        [k in keyof T]: any;
    };
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
