import { File as NiceFile } from "@nice/file";
import { MaybePromise } from "./promise";
import { ResourceInstance } from "./resource";
import { Location, getPatternLocations } from "./locations";
import { LoadedConfiguration } from ".";

export type PropertyPath = (string | number)[];

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

  export type ResourceMethod<TInput extends object = any> = {
    $effect: "resource-method";
    description?: string;
    resourceId: string;
    method: string;
    input?: TInput;
  };

  export type Any = File | Function | Shell | ResourceMethod;
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

export namespace ResourceEffect {
  export type Base = Effect.Base & { resourceId: string };

  export type Create<TArgs extends object = any> = {
    $effect: "resource-create";
    description?: string;
    resourceId: string;
    instance: ResourceInstance<TArgs>;
  };

  export type Remove = {
    $effect: "resource-remove";
    resourceId: string;
  };

  export type Input<TArgs extends object = any> = {
    $effect: "resource-input";
    input: TArgs;
    resourceId: string;
    methodName: string;
  };

  export type Output<TOut extends object = any> = {
    $effect: "resource-output";
    output: TOut;
    resourceId: string;
    methodName: string;
  };

  export type OutputEffect<TEffect extends Effect.Base = Effect.Any> = {
    $effect: "resource-effect";
    effect: TEffect;
    resourceId: string;
    methodName: string;
    path?: PropertyPath;
  };

  export type Any<TEffect extends Effect.Base = Effect.Any> =
    ResourceEffect.Base &
      (Create | Remove | Input | Output | OutputEffect<TEffect>);
}

export const resourceEffectTypes = [
  "resource-create",
  "resource-remove",
  "resource-input",
  "resource-output",
  "resource-effect",
];

export function isResourceEffect(o: Effect.Base): o is ResourceEffect.Any {
  return o && o.$effect && resourceEffectTypes.indexOf(o.$effect) >= 0;
}

export function isResourceCreateEffect(
  e: ResourceEffect.Base
): e is ResourceEffect.Create {
  return e?.$effect == "resource-create";
}

export function isResourceOutputEffect(
  e: ResourceEffect.Base
): e is ResourceEffect.OutputEffect {
  return e?.$effect == "resource-effect";
}

// export type ResourceEffect<T extends Effect.Base = Effect.Any> = {
//   effect: T;
//   origin?: {
//     resourceId: string;
//     method: string;
//     path?: (string | number)[];
//     onMethodResultAsync?: (result: any) => Promise<any>;
//   };
// };

export type Plan<E extends Effect.Base = Effect.Any> = {
  description?: string;
  effects: ResourceEffect.Any<E>[];
  finalConfig?: LoadedConfiguration;
};

export function isPlan(o: any): o is Plan {
  return !!o && typeof o == "object" && "effects" in o;
}

export type Effector<T extends Effect.Base = ResourceEffect.Any, C = any> = {
  describe(effect: T, context: C): string;
  apply(effect: T, context: C): Promise<any>;
};

export type EffectorSet<
  TEffect extends Effect.Base = ResourceEffect.Any,
  C = any
> = {
  [T in TEffect["$effect"]]: Effector<Extract<TEffect, { $effect: T }>, C>;
};
