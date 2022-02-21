import os from "os";
import path from "path";
import { spawn } from "child_process";
import { ellipsis } from "./util/ellipsis";
import { relative } from "./util/files";
import prettyjson from "prettyjson";
import { green } from "chalk";
import {
  Effect,
  Effector,
  EffectorSet,
  resourceId,
  LoadedConfiguration,
  LoadedResource,
  Plan,
} from "@fx/plugin";
import { gray, yellow } from "chalk";

export type EffectorContext = {
  config?: LoadedConfiguration;
  planMethod?(
    methodName: string,
    options?: {
      resources?: LoadedResource[];
      input?: object;
      config?: LoadedConfiguration;
    }
  ): Promise<Plan | null>;
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
    const { resourceId, method, path } = origin ?? {};
    return `${
      resourceId
        ? resourceId +
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

export type ProcessResult = {
  code: number | null;
  stdout: string;
  stderr: string;
};

const Shell: Effector<Effect.Shell, EffectorContext> = {
  describe(e) {
    const { command, cwd, description } = e.effect;
    const desc = description ? `# ${description}` : "";
    const cwds = cwd
      ? ` in ${ellipsis(path.relative(process.cwd(), cwd))}`
      : ``;
    return `shell${cwds}: ${[green(command), gray(desc)].join(" ")}`;
  },
  async apply(e) {
    const { command, cwd, async } = e.effect;
    const onComplete = e.origin?.onMethodResultAsync;
    if (!command) return;
    return new Promise<ProcessResult | void>((resolve, reject) => {
      const [cmd, ...args] = command.split(" ");
      const proc = spawn(cmd, args, {
        cwd,
        shell: true,
        stdio: ["inherit", "pipe", "pipe"],
      });
      const result: ProcessResult = {
        stdout: "",
        stderr: "",
        code: null,
      };
      proc.on("error", (err) => {
        reject(err);
      });
      proc.stdout.on("data", (d) => {
        result.stdout += d;
        process.stdout.write(d);
      });
      proc.stderr.on("data", (d) => {
        result.stderr += d;
        process.stderr.write(d);
      });
      proc.on("close", (code) => {
        result.code = code;
        if (async) {
          onComplete?.(result);
        } else {
          resolve(result);
        }
      });
      if (async) resolve();
    });
  },
};

const RemoveResource: Effector<Effect.RemoveResource, EffectorContext> = {
  describe(e, c) {
    const {
      effect: { resourceId },
    } = e;
    return `delete resource ${resourceId}`;
  },
  async apply(e, c) {
    const {
      effect: { resourceId },
    } = e;
    const { config } = c;
    if (!config)
      throw new Error(
        "a valid fx project configuration is required to work with resources"
      );
    config?.removeResource(resourceId);
    await config.projectFile.save();
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
        ? os.EOL + prettyjson.render(detail, {}, 4)
        : "";
    return `${!!existing ? "update" : "create"} resource ${
      resourceId(instance) != origin?.resourceId ? resourceId(instance) : ""
    }${gray("in")} ${path.relative(
      process.cwd(),
      config.projectFile.path
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
      origin,
    } = e;
    const target = origin?.resourceId != resourceId ? ` on ${resourceId}` : "";
    return `run method ${yellow(`[${method}]`)}${target}`;
  },
  async apply(e, c) {
    const {
      effect: { method, resourceId, input },
    } = e;
    const { config } = c;
    if (!config)
      throw new Error(
        "a valid fx project configuration is required to work with resources"
      );
    console.log("");
    return c.planMethod?.(method, {
      resources: [config.getResource(resourceId)!],
      input,
      config,
    });
  },
};

const Effectors: EffectorSet<Effect.Any, EffectorContext> = {
  file: File,
  function: Function,
  shell: Shell,
  resource: Resource,
  "resource-method": ResourceMethod,
  "remove-resource": RemoveResource,
};

export function getEffector<T extends Effect.Any = Effect.Any>(
  e: T
): Effector<T, EffectorContext> {
  return Effectors[e.$effect] as Effector<T, EffectorContext>;
}
