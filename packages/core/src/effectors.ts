import { exec } from "child_process";
import { ellipsis } from "./util/ellipsis";
import { relative } from "./util/files";
import { Effect, Effector, EffectorSet, resourceId } from "@fx/plugin";

export type ResourceEffect<T extends Effect.Any = Effect.Any> = {
  resourceId: string;
  method: string;
  path: (string | number)[];
  effect: T;
};

const File: Effector<Effect.File> = {
  describe(e) {
    const { file } = e;
    return file.isCopy()
      ? `copy file: ${ellipsis(relative(e.file.sourcePath))} to ${ellipsis(
          relative(e.file.path)
        )}`
      : `create file: ${e.file.shortDescription()}`;
  },
  async apply(e) {
    const { file } = e;
    await file.save();
    return e.file.path;
  },
};

const Function: Effector<Effect.Function> = {
  describe(e) {
    return e.description ?? "execute function";
  },
  async apply(e) {
    return e.body?.();
  },
};

const Shell: Effector<Effect.Shell> = {
  describe(e) {
    return `invoke: '${e.command}'${
      e.cwd ? ` in directory ${ellipsis(e.cwd)}` : ``
    }`;
  },
  async apply(e) {
    if (!e?.command) return;
    return new Promise((resolve, reject) => {
      exec(
        e.command,
        { cwd: e?.cwd ? e.cwd : process.cwd() },
        (err, stdout, stderr) => {
          if (err || stderr) return reject({ error: err || stderr });
          resolve(stdout);
        }
      );
    });
  },
};

const Resource: Effector<Effect.Resource<any>> = {
  describe(e) {
    return `add resource ${resourceId(e.instance)}`;
  },
  async apply(e) {},
};

const Effectors: EffectorSet = {
  file: File,
  function: Function,
  shell: Shell,
  resource: Resource,
};

export function getEffector<T extends Effect.Any = Effect.Any>(
  e: T
): Effector<T> {
  return Effectors[e.$effect] as Effector<T>;
}

export async function applyEffects<C>(
  effects: ResourceEffect[],
  context: C
): Promise<any[]> {
  if (!effects?.length) {
    return [];
  }
  const tasks = Promise.all(
    effects?.map((effect) => {
      const effector = getEffector(effect);
      return effector.apply(effect, context);
    })
  );
  return await tasks;
}

export function printEffects<C>(effects: Effect.Any[], context: C) {
  return effects
    ?.map((effect) => getEffector(effect).describe(effect, context))
    ?.join("\n");
}
