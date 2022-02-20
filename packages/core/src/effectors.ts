import os from "os";
import path from "path";
import { exec } from "child_process";
import { ellipsis } from "./util/ellipsis";
import { relative } from "./util/files";
import prettyjson from "prettyjson";
import {
  Effect,
  Effector,
  EffectorSet,
  resourceId,
  LoadedConfiguration,
} from "@fx/plugin";
import { gray } from "chalk";

export type EffectorContext = {
  config?: LoadedConfiguration;
};

const File: Effector<Effect.File, EffectorContext> = {
  describe(e) {
    const { file, description } = e.effect;
    return description
      ? description + " " + file.shortDescription()
      : file.isCopy()
      ? `copy file: ${path.join(
          gray(ellipsis(relative(path.dirname(file.copyFrom!)))),
          path.basename(file.copyFrom!)
        )} ${gray("to")} ${ellipsis(relative(file.path))}`
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
    const { command, cwd, description } = e.effect;
    const desc = description ? `[${description}]` : "";
    const cwds = cwd ? `in directory ${ellipsis(cwd)}` : ``;
    return [`shell: '${command}'`, cwds, desc].join(" ");
  },
  async apply(e) {
    const { command, cwd } = e.effect;
    if (!command) return;
    return new Promise((resolve, reject) => {
      exec(
        command,
        { cwd: cwd ? cwd : process.cwd() },
        (err, stdout, stderr) => {
          if (err || stderr) {
            console.error(err || stderr);
            return reject(err || stderr);
          }
          console.log(stdout);
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
      origin,
    } = e;
    const { config } = c;
    if (!config)
      throw new Error(
        "a valid fx project configuration is required to work with resources"
      );
    const existing = config?.project?.resources?.find(
      (r) => resourceId(r) == resourceId(instance)
    );
    const detail = origin ? instance.inputs?.[origin.method] : {};
    const detailString =
      detail && Object.keys(detail).length
        ? os.EOL + prettyjson.render(detail, {}, 2)
        : "";
    return `${!!existing ? "update" : "create"} resource ${resourceId(
      instance
    )}${detailString}`;
  },
  async apply(e, c) {
    const {
      effect: { instance },
    } = e;
    const { config } = c;
    if (!config)
      throw new Error(
        "a valid fx project configuration is required to work with resources"
      );
    config.setResource(instance);
    await config.projectFile.save();
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
