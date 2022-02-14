import os from "os";
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
} from "@fx/plugin";

export type EffectorContext = {
  config: LoadedConfig;
};

const File: Effector<Effect.File, EffectorContext> = {
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

const Function: Effector<Effect.Function, EffectorContext> = {
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

const Shell: Effector<Effect.Shell, EffectorContext> = {
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

const Resource: Effector<Effect.Resource<any>, EffectorContext> = {
  describe(e, c) {
    const {
      effect: { instance },
      origin: { method },
    } = e;
    const {
      config: { project },
    } = c;
    const existing = project?.resources?.find(
      (r) => resourceId(r) == resourceId(instance)
    );
    return `${!!existing ? "update" : "create"} resource ${resourceId(
      instance
    )}${os.EOL}${prettyjson.render(instance.inputs?.[method], {}, 2)}`;
  },
  async apply(e, c) {
    const {
      effect: { instance },
    } = e;
    const {
      config: { project, projectFile },
    } = c;
    const existingIndex = project?.resources?.findIndex(
      (r) => resourceId(r) == resourceId(instance)
    );
    if (existingIndex >= 0) {
      project.resources.splice(existingIndex, 1, instance);
    } else {
      project.resources.push(instance);
    }
    await projectFile.save();
  },
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
): Effector<T, EffectorContext> {
  return Effectors[e.$effect] as Effector<T, EffectorContext>;
}
