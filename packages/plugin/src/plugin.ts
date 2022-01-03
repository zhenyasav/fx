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
  resources(): MaybePromise<Resource[]>;
};

export type Resource = {
  name: string;
  description?: string;
  methods: {
    create: Method;
    [methodName: string]: Method;
  };
};

export type Method<TInput = any> = {
  getInput(defaults?: Partial<TInput>): MaybePromise<TInput>;
  execute(context: { input: TInput }): MaybePromise<MethodResult>;
};

export function method<T extends z.ZodObject<z.ZodRawShape>>({
  inputShape,
  ...rest
}: { inputShape?: T } & Pick<
  Method<z.infer<T>>,
  "execute"
>): Method<z.infer<T>> {
  return inputShape
    ? {
        getInput(defaults?: Partial<z.infer<T>>) {
          return inquire(inputShape, defaults);
        },
        ...rest,
      }
    : {
        getInput(defaults: z.infer<T>) {
          return defaults;
        },
        ...rest,
      };
}

export type MethodResult<
  TEffect extends { type: string } = Effect.Any,
  TValue = any
> = void | {
  description?: string;
  value?: TValue;
  effects: TEffect[];
};
