import { z } from "zod";
import { Effect } from "./effects";
export declare type MaybePromise<T> = T | Promise<T>;
export declare function isPromise<T>(p: any): p is Promise<T>;
export declare function promise<T>(p: MaybePromise<T>): Promise<T>;
export declare type Plugin = {
    readonly name: string;
    resources(): MaybePromise<ResourceDefinition[]>;
};
export declare type ResourceInstance<TInput = any, TOutput = any> = {
    id: string;
    type: string;
    inputs?: TInput;
    outputs?: TOutput;
};
export declare function printResourceId(instance: ResourceInstance): string;
export declare type ResourceDefinition<TCreateArgs = any> = {
    type: string;
    description?: string;
    methods?: {
        create?: Method<TCreateArgs>;
    } & {
        [methodName: string]: Method;
    };
};
export declare type Typed = {
    type: string;
};
export declare type Method<TInput = any, TOutput = any, TEffect extends Typed = Effect.Any> = {
    inputs?(defaults?: Partial<TInput>): MaybePromise<TInput>;
    body?(context: {
        input: TInput;
    }): MaybePromise<MethodResult<TOutput, TEffect>>;
};
export declare type MethodResult<TValue = any, TEffect extends Typed = Effect.Any> = void | {
    description?: string;
    value?: TValue;
    effects?: TEffect[];
};
export declare function method<T extends z.ZodObject<z.ZodRawShape>>({ inputShape, ...rest }: {
    inputShape?: T;
} & Pick<Method<z.infer<T>>, "body">): Method<z.infer<T>>;
