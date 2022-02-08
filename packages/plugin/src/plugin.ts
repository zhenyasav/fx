import { z } from "zod";
import { inquire } from "@fx/zod-inquirer";
import { Effect } from "./effects";

export type MaybePromise<T> = T | Promise<T>;

export function isPromise<T>(p: any): p is Promise<T> {
  return typeof p?.then == "function";
}

export function promise<T>(p: MaybePromise<T>): Promise<T> {
  return isPromise(p) ? p : Promise.resolve(p);
}

export type Plugin = {
  readonly name: string;
  resources(): MaybePromise<ResourceDefinition[]>;
};

export type ResourceInstance<TInput = any, TOutput = any> = {
  id: string;
  type: string;
  inputs?: TInput;
  outputs?: TOutput;
};

export function printResourceId(instance: ResourceInstance) {
  if (!instance) return `[null]`;
  const { id, type } = instance;
  return `${type}:${id}`;
}

export type ResourceDefinition<TCreateArgs = any> = {
  type: string;
  description?: string;
  methods?: {
    create?: Method<TCreateArgs>;
  } & { [methodName: string]: Method };
};

export type Typed = { type: string };

export type Method<
  TInput = any,
  TOutput = any,
  TEffect extends Typed = Effect.Any
> = {
  inputs?(defaults?: Partial<TInput>): MaybePromise<TInput>;
  body?(context: {
    input: TInput;
  }): MaybePromise<MethodResult<TOutput, TEffect>>;
};

export type MethodResult<
  TValue = any,
  TEffect extends Typed = Effect.Any
> = void | {
  description?: string;
  value?: TValue;
  effects?: TEffect[];
};

export function method<T extends z.ZodObject<z.ZodRawShape>>({
  inputShape,
  ...rest
}: { inputShape?: T } & Pick<Method<z.infer<T>>, "body">): Method<z.infer<T>> {
  return inputShape
    ? {
        inputs(defaults?: Partial<z.infer<T>>) {
          return inquire(inputShape, defaults);
        },
        ...rest,
      }
    : {
        inputs(defaults: z.infer<T>) {
          return defaults;
        },
        ...rest,
      };
}
