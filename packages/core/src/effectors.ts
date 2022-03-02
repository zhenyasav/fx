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
  ResourceEffect,
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

const ResourceCreate: Effector<ResourceEffect.Create<any>, EffectorContext> = {
  describe(e, c) {
    const { description, instance } = e;
    const { config } = c;
    if (!config)
      throw new Error(
        "a valid fx project configuration is required to work with resources"
      );
    const desc = description ?? `create resource ${resourceId(instance)}`;
    return `${desc} ${gray("in")} ${path.relative(
      process.cwd(),
      config.projectFile.path
    )}`;
  },
  async apply(e, c) {
    const { instance } = e;
    const { config } = c;
    if (!config)
      throw new Error(
        "a valid fx project configuration is required to work with resources"
      );
    config.setResource(instance);
    await config.projectFile.save();
  },
};

const ResourceRemove: Effector<ResourceEffect.Remove, EffectorContext> = {
  describe(e, c) {
    const { resourceId } = e;
    return `delete resource ${resourceId}`;
  },
  async apply(e, c) {
    const { resourceId } = e;
    const { config } = c;
    if (!config)
      throw new Error(
        "a valid fx project configuration is required to work with resources"
      );
    config?.removeResource(resourceId);
    await config.projectFile.save();
  },
};

const ResourceInput: Effector<ResourceEffect.Input<any>, EffectorContext> = {
  describe(e) {
    const { methodName, input } = e;
    const isEmpty = Object.keys(input)?.length == 0;
    return `store inputs for method ${methodName}${
      !isEmpty ? os.EOL + prettyjson.render(input, {}, 2) : ""
    }`;
  },
  async apply(e, c) {
    const { input, methodName, resourceId } = e;
    const { config } = c;
    if (!config)
      throw new Error(
        "a valid fx project configuration is required to work with resources"
      );
    config.setMethodInput(resourceId, methodName, input);
    await config.projectFile.save();
  },
};

const ResourceOutput: Effector<ResourceEffect.Output<any>, EffectorContext> = {
  describe(e) {
    const { methodName } = e;
    return `store output for method ${methodName}`;
  },
  async apply(e, c) {
    const { resourceId, methodName, output } = e;
    const { config } = c;
    if (!config)
      throw new Error(
        "a valid fx project configuration is required to work with resources"
      );
    config.setMethodResult(resourceId, methodName, [], output);
    await config.projectFile.save();
  },
};

const ResourceEffector: Effector<ResourceEffect.OutputEffect, EffectorContext> =
  {
    describe(e, c) {
      const { effect } = e;
      const effector = getEffector(effect);
      return effector.describe(effect, c);
    },
    async apply(e, c) {
      const { effect, resourceId, methodName, path } = e;
      const { config } = c;
      const effector = getEffector(effect);
      const result = await effector.apply(effect, c);
      if (config && resourceId && methodName && typeof result != "undefined") {
        config.setMethodResult(resourceId, methodName, path ?? [], result);
        await config.projectFile.save();
      }
    },
  };

const ResourceMethod: Effector<ResourceEffect.Method, EffectorContext> = {
  describe(e) {
    const { methodName } = e;
    return `run method ${yellow(`[${methodName}]`)}`;
  },
  async apply(e, c) {
    const { methodName, resourceId, input } = e;
    const { config } = c;
    if (!config)
      throw new Error(
        "a valid fx project configuration is required to work with resources"
      );
    console.log("");
    return c.planMethod?.(methodName, {
      resources: [config.getResource(resourceId)!],
      input,
      config,
    });
  },
};

const ResourceEffectors: EffectorSet<ResourceEffect.Any, EffectorContext> = {
  "resource-create": ResourceCreate,
  "resource-remove": ResourceRemove,
  "resource-input": ResourceInput,
  "resource-output": ResourceOutput,
  "resource-effect": ResourceEffector,
  "resource-method": ResourceMethod,
};

export function getResourceEffector<
  T extends ResourceEffect.Any = ResourceEffect.Any
>(e: T): Effector<T, EffectorContext> {
  return ResourceEffectors[e.$effect] as Effector<T, EffectorContext>;
}

const File: Effector<Effect.File, EffectorContext> = {
  describe(e) {
    const { file, description } = e;
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
    const { file } = e;
    await file.save();
    return file.path;
  },
};

const Function: Effector<Effect.Function, EffectorContext> = {
  describe(e) {
    const { description } = e;
    return `${description ?? "execute a function"}`;
  },
  async apply(e) {
    const { body } = e;
    return body?.();
  },
};

export type ProcessResult = {
  code: number | null;
  stdout?: string;
  stderr?: string;
};

const Shell: Effector<Effect.Shell, EffectorContext> = {
  describe(e) {
    const { command, cwd, description } = e;
    const desc = description ? `# ${description}` : "";
    const cwds = cwd
      ? ` in ${ellipsis(path.relative(process.cwd(), cwd))}`
      : ``;
    return `shell${cwds}: ${[green(command), gray(desc)].join(" ")}`;
  },
  async apply(e) {
    const {
      command,
      cwd,
      async,
      captureStderr = true,
      captureStdout = true,
    } = e;
    // const onComplete = e.origin?.onMethodResultAsync;
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
          // onComplete?.(result);
          // TODO: capture async shell results?
        } else {
          const { code, stderr, stdout } = result;
          resolve({
            code,
            ...(captureStdout ? { stdout } : {}),
            ...(captureStderr ? { stderr } : {}),
          });
        }
      });
      if (async) resolve();
    });
  },
};

const Effectors: EffectorSet<Effect.Any, EffectorContext> = {
  file: File,
  function: Function,
  shell: Shell,
};

export function getEffector<T extends Effect.Any = Effect.Any>(
  e: T
): Effector<T, EffectorContext> {
  return Effectors[e.$effect] as Effector<T, EffectorContext>;
}
