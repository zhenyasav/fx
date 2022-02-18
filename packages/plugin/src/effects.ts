import { File as NiceFile } from "@nice/file";
import { MaybePromise } from "./promise";
import { ResourceInstance } from "./resource";

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

export type ObjectWithEffects = {
  [k: string]: any | Effect.Base;
};

export type EffectLocation<T extends Effect.Base> = {
  effect: T;
  path: (string | number)[];
};

export function getEffectLocations<T extends Effect.Base = Effect.Any>(
  o: ObjectWithEffects
): EffectLocation<T>[] {
  if (typeof o != "object") return [];
  const results: EffectLocation<T>[] = [];
  for (let i in o) {
    const v = o[i];
    if (isEffect(v)) {
      results.push({ effect: v as T, path: [i] });
    } else if (Array.isArray(v)) {
      const effectsInArray = v.filter(isEffect);
      results.push(
        ...effectsInArray.map((e, x) => ({
          effect: e as T,
          path: [i, x],
        }))
      );
    }
  }
  return results;
}

export type ResourceEffect<T extends Effect.Base = Effect.Any> = {
  effect: T;
  origin: {
    resource: ResourceInstance;
    method: string;
    path?: (string | number)[];
  };
};

export type Plan<E extends Effect.Base = Effect.Any> = ResourceEffect<E>[] | [];

export type ResourcePlan<TInput extends object = any> = [
  ResourceEffect<Effect.Resource<TInput>>,
  ...ResourceEffect<Effect.Any>[]
];

export type Effector<T extends Effect.Base = Effect.Any, C = any> = {
  describe(effect: ResourceEffect<T>, context: C): string;
  apply(effect: ResourceEffect<T>, context: C): Promise<any>;
};

export type EffectorSet<TEffect extends Effect.Base = Effect.Any, C = any> = {
  [T in TEffect["$effect"]]: Effector<Extract<TEffect, { $effect: T }>, C>;
};
