import { z } from "zod";
import { Effect } from "./effects";
export declare type MaybePromise<T> = T | Promise<T>;
export declare function isPromise<T>(p: any): p is Promise<T>;
export declare function promise<T>(p: MaybePromise<T>): Promise<T>;
export declare type Plugin = {
    readonly name: string;
    resources(): MaybePromise<ResourceDefinition[]>;
};
export declare type ResourceDefinition = {
    type: string;
    description?: string;
    methods: {
        create: Method;
        [methodName: string]: Method;
    };
};
export declare type Method<TInput = any> = {
    getInput?(defaults?: Partial<TInput>): MaybePromise<TInput>;
    execute?(context: {
        input: TInput;
    }): MaybePromise<MethodResult>;
};
export declare function method<T extends z.ZodObject<z.ZodRawShape>>({ inputShape, ...rest }: {
    inputShape?: T;
} & Pick<Method<z.infer<T>>, "execute">): Method<z.infer<T>>;
export declare type MethodResult<TEffect extends {
    type: string;
} = Effect.Any, TValue = any> = void | {
    description?: string;
    value?: TValue;
    effects: TEffect[];
};
