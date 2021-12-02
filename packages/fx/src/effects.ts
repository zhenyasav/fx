import { File } from "@nice/ts-template";
import { ellipsis } from "./util/ellipsis.js";
import { relative } from "./util/relative.js";

export type WriteFileEffect = {
  type: "write-file";
  file: File;
};

export type StartShellEffect = {
  type: "shell";
  command: string;
};

export type RunPackageScriptEffect = {
  type: "package-script";
  name: string;
};

export type Effect = WriteFileEffect | RunPackageScriptEffect;

export type EffectHandler<T extends Effect> = {
  describe(e: T): string;
  apply(e: T): Promise<any>;
};

export const WriteFileHandler: EffectHandler<WriteFileEffect> = {
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

export const PackageScriptHandler: EffectHandler<RunPackageScriptEffect> = {
  describe(e) {
    return `run package script ${e.name}`;
  },
  async apply(e) {
    throw new Error("not implemented");
  },
};

export type AllHandlers = {
  [T in Effect["type"]]: EffectHandler<Extract<Effect, { type: T }>>;
};

export const Effects: AllHandlers = {
  "write-file": WriteFileHandler,
  "package-script": PackageScriptHandler,
};

export function handler<T extends Effect = Effect>(e: T): EffectHandler<T> {
  return Effects[e.type] as EffectHandler<T>;
}

export async function applyEffects(
  effects: Effect[] | undefined,
  dryRun = true,
  caption: string
) {
  if (caption) console.info(`${dryRun ? "dry run" : "plan"}: ${caption}`);
  console.info("cwd:", process.cwd());
  if (effects) {
    console.info(`\n${effects.length} actions:`);
    if (dryRun) {
      effects?.forEach((effect) =>
        console.log(handler(effect).describe(effect))
      );
    } else {
      const tasks = Promise.all(
        effects?.map((effect) => {
          const h = handler(effect);
          console.log(h.describe(effect));
          return h.apply(effect);
        })
      );
      console.log("\nexecuting ...");
      await tasks;
    }
  } else {
    console.log("nothing to do");
  }
}
