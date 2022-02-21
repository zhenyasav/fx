import os from "os";
import path from "path";
import {
  resourceId,
  promise,
  LoadedResource,
  getPendingResourceReferences,
  MethodResult,
  getEffectLocations,
  Effect,
  ResourceEffect,
  Plan,
  LoadedConfiguration,
  scrubEffects,
} from "@fx/plugin";
import { executeDirectoryTemplate } from "@nice/plate";
import { randomString } from "./util/random";
import { getEffector } from "./effectors";
import { ConfigLoaderOptions, ConfigLoader } from "./config";
import {
  getResourceQuestionGenerator,
  getDependencyGraph,
} from "./resourceDeps";
import { ResourceInstance } from "@fx/plugin";
import { solve } from "dependency-solver";
import { patchTsConfigForTsNode } from "./util/tsconfig";
import { uniq } from "./util/collections";
import { cyan, yellow } from "chalk";

const clone = (o: any) => JSON.parse(JSON.stringify(o));

function isResourceEffect(
  o: ResourceEffect<Effect.Any>
): o is ResourceEffect<Effect.Resource> {
  return o && o.effect?.$effect == "resource";
}

export type FxOptions = ConfigLoaderOptions;

function printEffect(
  e: ResourceEffect<Effect.Any>,
  config?: LoadedConfiguration
): string {
  const effector = getEffector(e.effect);
  return (
    (e.origin ? cyan(e.origin.resourceId) + " " : "") +
    effector.describe(e, { config })
  );
}

function isEffectVisible(plan: Plan, config?: LoadedConfiguration) {
  const { effects } = plan;
  return (e: ResourceEffect) => {
    if (isResourceEffect(e)) {
      const exists = config?.getResource(resourceId(e.effect.instance));
      if (!exists) {
        const firstResourceEffectForInstance = effects.find(
          (ex) =>
            isResourceEffect(ex) &&
            resourceId(ex.effect.instance) == resourceId(e.effect.instance)
        );
        if (firstResourceEffectForInstance == e) {
          return true;
        } else return false;
      }
    } else {
      return true;
    }
  };
}

export class Fx {
  private options: FxOptions;
  private _config: LoadedConfiguration | undefined;
  private configLoader: ConfigLoader;
  constructor(options?: FxOptions) {
    this.options = { cwd: process.cwd(), ...options };
    this.configLoader = new ConfigLoader();
  }
  public async config() {
    // ensure ts-node can run
    const cwd = this.options.cwd
      ? this.options.cwd
      : this.options.configFile
      ? path.dirname(this.options.configFile)
      : null;
    if (cwd && !this._config) {
      await patchTsConfigForTsNode(cwd);
    }
    return (
      this._config ??
      (this._config = await this.configLoader.load(this.options))
    );
  }
  public async requireConfig(): Promise<LoadedConfiguration> {
    const config = await this.config();
    if (!config)
      throw new Error("no fx project configuration file .fx.* found");
    return config;
  }
  async getResourcesWithMethod(methodName: string): Promise<LoadedResource[]> {
    const config = await this.requireConfig();
    const resources = config?.getResources();
    return resources?.filter(
      (r) => r.definition?.methods && methodName in r.definition.methods
    );
  }

  async printPlan(plan: Plan): Promise<string> {
    const { effects, description } = plan;
    const config = await this.config();
    const indent = "  ";
    const visibleEffects = effects.filter(isEffectVisible(plan, config));
    const desc = visibleEffects
      .map((e) => indent + printEffect(e, config))
      .join(os.EOL);
    return `plan ${
      description
        ? description + ` (${visibleEffects.length} tasks):`
        : `plan with ${visibleEffects.length} tasks:`
    }\n${desc}`;
  }
  async executePlan(plan: Plan) {
    const config = await this.config();
    const { effects } = plan;
    const createdResources = [];
    const isVisible = isEffectVisible(plan, config);
    for (let i in effects) {
      const effect = effects[i];
      
      const effector = getEffector(effect.effect);
      if (isVisible(effect)) {
        console.log("applying " + printEffect(effect, config));
      }
      const result = await effector.apply(effect, { config });
      if (
        config &&
        isResourceEffect(effect) &&
        !config.getResource(resourceId(effect.effect.instance))
      ) {
        createdResources.push(effect);
      }
      if (typeof result != "undefined" && effect.origin && config) {
        const { resourceId, method, path } = effect.origin;
        config.setMethodResult(resourceId, method, path ?? [], result);
        await config.projectFile.save();
      }
    }
    return { created: createdResources };
  }
  public async planInit(options?: { selector?: string }): Promise<Plan | null> {
    const { selector } = { ...options };
    if (selector) {
      // init resource
      // const config = await this.requireConfig();
      return null;
    } else {
      // init project
      const config = await this.config();
      if (config)
        throw new Error(`fx project already exists ${config.configFilePath}`);
      const cwd = process.cwd();
      const files = await executeDirectoryTemplate({
        templateDirectory: path.resolve(__dirname, "../templates/project"),
        outputDirectory: cwd,
      });
      if (files?.length) {
        const filesPlan: ResourceEffect[] = files.map((file) => ({
          effect: {
            $effect: "file",
            file,
          },
        }));
        const plan: Plan = {
          effects: [
            ...filesPlan,
            {
              effect: {
                description: "add @fx/core to dev dependencies",
                $effect: "shell",
                command: "npm i -D @fx/core",
              },
            },
          ],
        };
        return plan;
      } else {
        throw new Error("failed to create fx project");
      }
    }
  }
  async planCreateResource<TInput extends object>(
    type: string,
    options?: { input?: TInput; config?: LoadedConfiguration }
  ): Promise<Plan> {
    const conf = options?.config ?? (await this.requireConfig()).clone();
    const definition = conf.getResourceDefinition(type);
    if (!definition) throw new Error(`resource of type '${type}' not found`);
    const instance: ResourceInstance = {
      id: randomString(),
      type,
    };
    const createResourceEffect: ResourceEffect<Effect.Resource> = {
      effect: {
        $effect: "resource",
        instance: clone(instance),
        description: `create ${resourceId(instance)}`,
      },
      origin: {
        resourceId: resourceId(instance),
        method: "create",
      },
    };
    conf.setResource(instance);
    const createplan = await this.planMethod("create", {
      resource: { instance, definition },
      input: options?.input,
      config: conf,
    });
    return {
      description: `create ${type}`,
      finalConfig: createplan?.finalConfig,
      effects: [createResourceEffect, ...(createplan?.effects ?? [])],
    };
  }
  async planRemoveResource(identifier: string): Promise<Plan> {
    const config = (await this.requireConfig()).clone();
    const resource = config.getResource(identifier);
    if (!resource) {
      throw new Error(`resource ${resourceId} not found`);
    }
    config.removeResource(identifier);
    return {
      description: `remove resource ${identifier}`,
      finalConfig: config,
      effects: [
        {
          effect: {
            $effect: 'remove-resource',
            resourceId: identifier
          },
          origin: {
            resourceId: resourceId(resource.instance),
            method: 'remove'
          }
        }
      ]
    }
  }
  async planMethod(
    methodName: string,
    options?: {
      resource?: LoadedResource;
      input?: { [k: string]: any };
      config?: LoadedConfiguration;
    }
  ): Promise<Plan | null> {
    const { resource, input: defaults } = { ...options };
    const resources: LoadedResource[] = resource
      ? [resource]
      : await this.getResourcesWithMethod(methodName);
    if (!resources?.length) return null;

    const results: ResourceEffect<Effect.Any>[] = [];
    const config = options?.config ?? (await this.requireConfig()).clone();

    function orderResources(resources: LoadedResource[]): LoadedResource[] {
      if (methodName == "create") {
        return resources;
      }
      const { graph, independents, errors } = getDependencyGraph({
        resources,
        methodName: "create",
      });
      if (errors.length) {
        throw new Error(errors.join(", "));
      }
      const sequence = solve(graph);
      const combined = uniq([...sequence, ...independents]);
      return combined.map((id) => config.getResource({ $resource: id })!);
    }

    const ordered =
      resources?.length > 1 ? orderResources(resources) : resources;

    function writeResourceMethodValue(
      sectionKey: "inputs" | "outputs",
      instance: ResourceInstance,
      value: any
    ) {
      const existing = config.getResource(resourceId(instance));
      const s = (x: any) => JSON.stringify(x);
      if (
        !existing?.instance?.[sectionKey]?.[methodName] ||
        s(existing.instance[sectionKey]?.[methodName]) != s(value)
      ) {
        // const instanceClone = clone(instance);
        const section = (instance[sectionKey] =
          instance[sectionKey] || {});
        section[methodName] = value;
        const resourceEffect: ResourceEffect = {
          effect: {
            $effect: "resource",
            instance: clone(instance),
          },
          origin: {
            method: methodName,
            resourceId: resourceId(instance),
          },
        };
        results.push(resourceEffect);
        // config.setResource(instanceClone);
      }
    }

    for (let resource of ordered) {
      const { definition, instance } = resource;

      const method = definition?.methods?.[methodName];
      if (!method) continue;

      if (method.implies?.length) {
        for (let implied of method.implies) {
          const plan = await this.planMethod(implied, {
            resource,
            config,
          });
          results.push(...(plan?.effects ?? []));
        }
      }

      const input = await promise(
        method.inputs?.({
          defaults,
          questionGenerator: getResourceQuestionGenerator(config),
          resource,
          config,
        })
      );

      if (input && Object.keys(input).length) {
        const pendingResourceRefs = getPendingResourceReferences(input) ?? [];
        for (let ref of pendingResourceRefs) {
          console.log("");
          console.log(
            yellow(
              `Creating '${ref.entity.$resource}' for ${resourceId(
                instance
              )}.${ref.path.join(".")}:`
            )
          );
          const newResourcePlan = await this.planCreateResource(
            ref.entity.$resource,
            { config }
          );
          const [newInstance, ...restOfNewPlan] = newResourcePlan.effects;
          if (newInstance) {
            const n = newInstance as ResourceEffect<Effect.Resource>;
            ref.entity.$resource = resourceId(n.effect.instance);
            results.push(newInstance);
          }
          results.push(...restOfNewPlan);
        }
        writeResourceMethodValue("inputs", instance, input);
      }

      const methodResult = await promise<MethodResult>(
        method.body?.({
          input,
          resource,
          config,
        })
      );

      if (typeof methodResult != "undefined") {
        // config.getResource(resourceId(instance))?.instance!,
        writeResourceMethodValue(
          "outputs",
          instance,
          scrubEffects(methodResult)
        );
        const effectLocations = getEffectLocations(methodResult);
        results.push(
          ...effectLocations.map((loc) => {
            const { entity, path } = loc;
            const r: ResourceEffect = {
              effect: entity,
              origin: {
                resourceId: resourceId(resource.instance),
                method: methodName,
                path,
              },
            };
            return r;
          })
        );
      }
    }

    return {
      description: `invoke ${methodName} on ${resources?.length} resources`,
      effects: results,
      finalConfig: config,
    };
  }
}
