import { File as NiceFile } from "@nice/file";
import { MaybePromise } from "./promise";
import { ResourceInstance } from "./resource";
import { Location, getPatternLocations } from "./locations";
import { LoadedConfiguration } from ".";

export namespace Effect {
  export type Base = { $effect: any };

  export type File<D = any> = {
    $effect: "file";
    description?: string;
    file: NiceFile<D>;
  };

  export type Function<R = any> = {
    $effect: "function";
    description?: string;
    body: () => MaybePromise<R>;
  };

  export type Shell = {
    $effect: "shell";
    description?: string;
    command: string;
    cwd?: string;
    async?: boolean;
  };

  export type Resource<TArgs extends object = any> = {
    $effect: "resource";
    description?: string;
    instance: ResourceInstance<TArgs>;
  };

  export type ResourceMethod<TInput extends object = any> = {
    $effect: "resource-method";
    description?: string;
    resourceId: string;
    method: string;
    input: TInput;
  };

  export type Any = File | Function | Shell | Resource | ResourceMethod;
}

export function isEffect(o: any): o is Effect.Base {
  return o && o?.$effect;
}

export function effects<T extends Effect.Base = Effect.Any>() {
  return function (o: T): T {
    if (isEffect(o)) return o as T;
    else throw new Error(`invalid effect ${o}`);
  };
}

export const effect = effects<Effect.Any>();

export function scrubEffect<T extends Effect.Base = Effect.Any>(o: T) {
  const result: any = {};
  for (let i in o) {
    const v = o[i];
    result[i] =
      typeof v == "number" ||
      typeof v == "string" ||
      typeof v == "boolean" ||
      v instanceof Date
        ? v
        : null;
  }
  return result;
}

export function scrubEffects(obj: any) {
  const result: any = {};
  if (
    typeof obj === "undefined" ||
    obj === null ||
    typeof obj == "number" ||
    typeof obj == "string" ||
    typeof obj == "boolean" ||
    obj instanceof Date
  )
    return obj;
  for (let key in obj) {
    const val = obj[key];
    if (Array.isArray(val)) {
      result[key] = val?.map((v) => scrubEffects(v));
    } else if (isEffect(val)) {
      result[key] = scrubEffect(val);
    } else {
      result[key] = val;
    }
  }
  return result;
}

export type ObjectWithEffects = {
  [k: string]: any | Effect.Base;
};

export function getEffectLocations<T extends Effect.Base = Effect.Any>(
  o: ObjectWithEffects
): Location<T>[] {
  return getPatternLocations(o, isEffect);
}

export type ResourceEffect<T extends Effect.Base = Effect.Any> = {
  effect: T;
  origin?: {
    resourceId: string;
    method: string;
    path?: (string | number)[];
    onMethodResultAsync?: (result: any) => Promise<any>;
  };
};

export type Plan<E extends Effect.Base = Effect.Any> = {
  description?: string;
  effects: ResourceEffect<E>[] | [];
  finalConfig?: LoadedConfiguration;
};

export type Effector<T extends Effect.Base = Effect.Any, C = any> = {
  describe(effect: ResourceEffect<T>, context: C): string;
  apply(effect: ResourceEffect<T>, context: C): Promise<any>;
};

export type EffectorSet<TEffect extends Effect.Base = Effect.Any, C = any> = {
  [T in TEffect["$effect"]]: Effector<Extract<TEffect, { $effect: T }>, C>;
};
