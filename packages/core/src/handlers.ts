// import { File } from "@nice/ts-template";
import { ellipsis } from "@fx/util";
import { relative } from "@fx/util";
import { Effects as E } from "@fx/plugin";

export namespace Handlers {
  
  const WriteFile: E.Handler<E.WriteFile> = {
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

  const PackageScript: E.Handler<E.PackageScript> = {
    describe(e) {
      return `run package script ${e.name}`;
    },
    async apply(e) {
      throw new Error("not implemented");
    },
  };

  const Shell: E.Handler<E.Shell> = {
    describe(e) {
      return ``;
    },
    async apply(e) {
      return {};
    },
  };

  const Handlers: E.Handlers = {
    "write-file": WriteFile,
    "package-script": PackageScript,
    shell: Shell,
  };

  export function get<T extends E.Effect = E.Effect>(e: T): E.Handler<T> {
    return Handlers[e.type] as E.Handler<T>;
  }
}

export async function applyEffects(
  effects: E.Effect[] | undefined,
  dryRun = true,
  caption: string
) {
  if (caption) console.info(`${dryRun ? "dry run" : "plan"}: ${caption}`);
  console.info("cwd:", process.cwd());
  if (effects) {
    console.info(`\n${effects.length} actions:`);
    if (dryRun) {
      effects?.forEach((effect) =>
        console.log(Handlers.get(effect).describe(effect))
      );
    } else {
      const tasks = Promise.all(
        effects?.map((effect) => {
          const h = Handlers.get(effect);
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
