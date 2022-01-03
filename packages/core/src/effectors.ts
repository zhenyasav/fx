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

const PackageScript: Effector<Effect.PackageScript> = {
  describe(e) {
    return `run package script ${e.name}`;
  },
  async apply(e) {
    throw new Error("not implemented");
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
  "package-script": PackageScript,
  shell: Shell,
};

export function getEffector<T extends Effect.Any = Effect.Any>(
  e: T
): Effector<T> {
  return Effectors[e.type] as Effector<T>;
}

export async function applyEffects(effects: Effect.Any[], caption: string) {
  if (caption) console.info(`plan: ${caption}`);
  if (!effects?.length) {
    console.info("nothing to do");
    return;
  }
  console.info("cwd:", process.cwd());
  console.info(`\n${effects.length} actions:`);
  const tasks = Promise.all(
    effects?.map((effect) => {
      const effector = getEffector(effect);
      console.log(effector.describe(effect));
      return effector.apply(effect);
    })
  );
  console.log("\nexecuting ...");
  await tasks;
}

export async function printEffects(effects: Effect.Any[], caption?: string) {
  if (caption) console.info(`dry run: ${caption}`);
  console.info("cwd:", process.cwd());
  console.info(`\n${effects.length} actions:`);
  effects?.forEach((effect) =>
    console.log(getEffector(effect).describe(effect))
  );
}
