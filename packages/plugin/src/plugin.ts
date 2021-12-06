import { Effects } from "./effects.js";
import { z } from "zod";
import { inquire } from "@fx/zod-inquirer";

export type MaybePromise<T> = T | Promise<T>;
function isPromise<T>(p: any): p is Promise<T> {
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
  input(defaults?: Partial<TInput>): MaybePromise<TInput>;
  execute(context: { input: TInput }): MaybePromise<MethodResult>;
};

export function method<T extends z.ZodObject<z.ZodRawShape>>({
  input,
  ...rest
}: { input: T } & Omit<Method<z.infer<T>>, "input">): Method<z.infer<T>> {
  return {
    input(defaults?: Partial<z.infer<T>>) {
      return inquire(input, defaults);
    },
    ...rest,
  };
}

export type MethodResult = void | {
  description?: string;
  effects: Effects.Effect[];
};
