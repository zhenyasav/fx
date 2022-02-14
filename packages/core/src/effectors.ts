import { exec } from "child_process";
import { ellipsis } from "./util/ellipsis";
import { relative } from "./util/files";
import prettyjson from "prettyjson";
import {
  Effect,
  Effector,
  EffectorSet,
  resourceId,
  LoadedConfig,
  Project,
} from "@fx/plugin";

const File: Effector<Effect.File> = {
  describe(e) {
    const { file } = e.effect;
    return file.isCopy()
      ? `copy file: ${ellipsis(relative(file.sourcePath))} to ${ellipsis(
          relative(file.path)
        )}`
      : `create file: ${file.shortDescription()}`;
  },
  async apply(e) {
    const { file } = e.effect;
    await file.save();
    return file.path;
  },
};

const Function: Effector<Effect.Function> = {
  describe(e) {
    const {
      effect: { description },
      origin,
    } = e;
    const { resource, method, path } = origin ?? {};
    return `${
      resource
        ? resourceId(resource) +
          "/" +
          method +
          (path?.length ? "." + path.join(".") : "") +
          ": "
        : ""
    }${description ?? "execute a function"}`;
  },
  async apply(e) {
    return e.effect.body?.();
  },
};

const Shell: Effector<Effect.Shell> = {
  describe(e) {
    const { command, cwd } = e.effect;
    return `invoke: '${command}'${cwd ? ` in directory ${ellipsis(cwd)}` : ``}`;
  },
  async apply(e) {
    const { command, cwd } = e.effect;
    if (!command) return;
    return new Promise((resolve, reject) => {
      exec(
        command,
        { cwd: cwd ? cwd : process.cwd() },
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
    const {
      effect: { instance },
      origin,
    } = e;

    return `${!!origin ? "update" : "create"} resource ${resourceId(
      instance
    )}\n${prettyjson.render(instance)}`;
  },
  async apply(e) {},
};

export type EffectorContext = {
  config: LoadedConfig;
  project: Project;
};

const ResourceMethod: Effector<Effect.ResourceMethod<any>, EffectorContext> = {
  describe(e) {
    const {
      effect: { method, resourceId },
    } = e;
    return `run method ${method} on ${resourceId}`;
  },
  async apply(e, c) {},
};

const Effectors: EffectorSet<Effect.Any, EffectorContext> = {
  file: File,
  function: Function,
  shell: Shell,
  resource: Resource,
  "resource-method": ResourceMethod,
};

export function getEffector<T extends Effect.Any = Effect.Any>(
  e: T
): Effector<T> {
  return Effectors[e.$effect] as Effector<T>;
}
