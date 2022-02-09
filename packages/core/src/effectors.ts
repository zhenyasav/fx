import { exec } from "child_process";
import { ellipsis } from "./util/ellipsis";
import { relative } from "./util/files";
import { Effect, Effector, EffectorSet } from "@fx/plugin";

const WriteFile: Effector<Effect.WriteFile> = {
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

const Effectors: EffectorSet = {
  "write-file": WriteFile,
  function: Function,
  shell: Shell,
};

export function getEffector<T extends Effect.Any = Effect.Any>(
  e: T
): Effector<T> {
  return Effectors[e.type] as Effector<T>;
}

export async function applyEffects(effects: Effect.Any[]): Promise<any[]> {
  if (!effects?.length) {
    return [];
  }
  const tasks = Promise.all(
    effects?.map((effect) => {
      const effector = getEffector(effect);
      return effector.apply(effect);
    })
  );
  return await tasks;
}

export function printEffects(effects: Effect.Any[]) {
  return effects
    ?.map((effect) => getEffector(effect).describe(effect))
    ?.join("\n");
}
