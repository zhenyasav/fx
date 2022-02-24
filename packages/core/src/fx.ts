import os from "os";
import path from "path";
import {
  resourceId,
  promise,
  isPlan,
  LoadedResource,
  getPendingResourceReferences,
  MethodResult,
  getEffectLocations,
  Effect,
  ResourceEffect,
  Plan,
  LoadedConfiguration,
  scrubEffects,
  PropertyPath,
  isResourceCreateEffect,
} from "@fx/plugin";
import { executeDirectoryTemplate } from "@nice/plate";
import { randomString } from "./util/random";
import { getResourceEffector } from "./effectors";
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
import { getDependents } from ".";

const clone = (o: any) => JSON.parse(JSON.stringify(o));

export type FxOptions = ConfigLoaderOptions;

function printEffect(
  e: ResourceEffect.Any,
  config?: LoadedConfiguration
): string {
  const effector = getResourceEffector(e);
  const { resourceId } = e;
  return [
    resourceId ? cyan(resourceId) : "",
    effector.describe(e, { config }),
  ].join(" ");
}

function isEffectVisible() {
  return (e: ResourceEffect.Any) => {
    return (
      e.$effect == "resource-create" ||
      e.$effect == "resource-effect" ||
      e.$effect == "resource-remove" ||
      e.$effect == "resource-method"
    );
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
  async printPlan(
    plan: Plan,
    options?: { showHiddenEffects?: boolean }
  ): Promise<string> {
    const { showHiddenEffects } = { showHiddenEffects: false, ...options };
    const { effects, description } = plan;
    const config = await this.config();
    const indent = "  ";
    const visibleEffects = showHiddenEffects
      ? effects
      : effects.filter(isEffectVisible());
    const desc = visibleEffects
      .map((e) => indent + printEffect(e, config))
      .join(os.EOL);
    return `plan ${
      description
        ? description + ` (${visibleEffects.length} tasks):`
        : `with ${visibleEffects.length} tasks:`
    }\n${desc}`;
  }
  async executePlan(plan: Plan) {
    const { effects, finalConfig } = plan;
    const config = finalConfig ?? (await this.config());
    const createdResources = [];
    const isVisible = isEffectVisible();
    const nextPlan: Plan = { effects: [] };
    for (let i in effects) {
      const effect = effects[i];
      const effector = getResourceEffector(effect);
      if (isVisible(effect)) {
        console.log("applying " + printEffect(effect, config));
      }
      if (config && isResourceCreateEffect(effect)) {
        createdResources.push(effect);
      }

      const result = await effector.apply(effect, {
        config,
        planMethod: (method, options) => this.planMethod(method, options),
      });

      if (isPlan(result)) {
        nextPlan.effects.push(...result.effects);
      }
    }
    return {
      created: createdResources,
      ...(nextPlan.effects.length ? { nextPlan } : {}),
    };
  }
  public async planInit(options?: {
    selector?: string;
    recursive?: boolean;
  }): Promise<Plan | null> {
    const { selector, recursive } = { recursive: false, ...options };
    function getDependentResourceSequence(
      rr: LoadedResource,
      config: LoadedConfiguration
    ) {
      const allresources = config.getResources();
      const { graph } = getDependencyGraph({
        resources: allresources,
        methodName: "create",
        allowReverseDeps: false,
      });
      const dependentIds = getDependents(resourceId(rr.instance), graph);
      const dependentIdsAndSelf = [...dependentIds, resourceId(rr.instance)];
      const dependents = dependentIds.map((id) => config.getResource(id)!);
      const onlyDepResources = [...dependents, rr];
      const { graph: graph2 } = getDependencyGraph({
        resources: onlyDepResources,
        methodName: "create",
        allowReverseDeps: false,
      });
      const sequence = solve(graph2);
      const finalSequenceIds = uniq(
        [...sequence].filter((id) => dependentIdsAndSelf.indexOf(id) >= 0)
      );
      const finalSequence = finalSequenceIds.map(
        (id) => config.getResource(id)!
      );
      return finalSequence;
    }

    if (selector) {
      // init resource
      const config = (await this.requireConfig()).clone();
      const resources = config.getResources(selector);
      const plan: Plan = {
        description: `initialize resources matching: ${selector}`,
        effects: [],
        finalConfig: config,
      };
      for (let rr of resources) {
        const sequence = !recursive
          ? [rr]
          : getDependentResourceSequence(rr, config);
        plan.effects.push(
          ...sequence.map((res) => {
            const reInitEffect: ResourceEffect.Method = {
              $effect: "resource-method",
              methodName: "create",
              resourceId: resourceId(res.instance),
            };
            return reInitEffect;
          })
        );
      }
      return plan;
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
        const filesPlan: ResourceEffect.OutputEffect<Effect.File>[] = files.map(
          (file) => ({
            $effect: "resource-effect",
            effect: {
              $effect: "file",
              file,
            },
          })
        );
        const plan: Plan = {
          effects: [
            ...filesPlan,
            {
              $effect: "resource-effect",
              effect: {
                $effect: "shell",
                description: "add @fx/core to dev dependencies",
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
    options?: {
      input?: TInput;
      config?: LoadedConfiguration;
      description?: string;
    }
  ): Promise<Plan> {
    const conf = options?.config ?? (await this.requireConfig()).clone();
    const definition = conf.getResourceDefinition(type);
    if (!definition) throw new Error(`resource of type '${type}' not found`);
    const instance: ResourceInstance = {
      id: randomString(),
      type,
    };
    const createResourceEffect: ResourceEffect.Create = {
      $effect: "resource-create",
      description: `create ${resourceId(instance)}`,
      resourceId: resourceId(instance),
      instance: clone(instance),
    };
    conf.setResource(instance);
    const createplan = await this.planMethod("create", {
      resources: [{ instance, definition }],
      input: options?.input,
      config: conf,
      description: options?.description,
    });
    return {
      description: `create ${type}`,
      finalConfig: createplan?.finalConfig,
      effects: [createResourceEffect, ...(createplan?.effects ?? [])],
    };
  }
  async planRemoveResource(selector: string): Promise<Plan> {
    const config = (await this.requireConfig()).clone();
    const resources = config.getResources(selector);
    resources.forEach((r) => config.removeResource(resourceId(r.instance)));
    return {
      description: `remove resources matching: ${selector}`,
      finalConfig: config,
      effects: [
        ...resources.map((rs) => ({
          $effect: "resource-remove" as "resource-remove",
          resourceId: resourceId(rs.instance),
        })),
      ],
    };
  }
  async planMethod(
    methodName: string,
    options?: {
      resources?: LoadedResource[];
      input?: { [k: string]: any };
      config?: LoadedConfiguration;
      description?: string;
    }
  ): Promise<Plan | null> {
    const { resources: rs, input: defaults } = { ...options };
    const resources: LoadedResource[] = rs?.length
      ? rs
      : await this.getResourcesWithMethod(methodName);
    if (!resources?.length) return null;

    const results: ResourceEffect.Any[] = [];
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
      return combined.map((id) => config.getResource(id)!);
    }

    const ordered =
      resources?.length > 1 ? orderResources(resources) : resources;

    function writeResourceMethodValue(
      sectionKey: "inputs" | "outputs",
      instance: ResourceInstance,
      value: any,
      path?: PropertyPath
    ) {
      const existing = config.getResource(resourceId(instance));
      const s = (x: any) => JSON.stringify(x);
      const methodValueDoesntExist =
        !existing?.instance?.[sectionKey]?.[methodName];
      const methodValueDiffersFromStored =
        s(existing?.instance[sectionKey]?.[methodName]) != s(value);
      if (methodValueDoesntExist || methodValueDiffersFromStored) {
        const section = (instance[sectionKey] = instance[sectionKey] || {});
        section[methodName] = value;
        if (sectionKey == "inputs") {
          const resourceEffect: ResourceEffect.Input = {
            $effect: "resource-input",
            methodName,
            resourceId: resourceId(instance),
            input: value,
          };
          results.push(resourceEffect);
        } else if (sectionKey == "outputs") {
          const resourceEffect: ResourceEffect.Output = {
            $effect: "resource-output",
            methodName,
            resourceId: resourceId(instance),
            output: value,
          };
          results.push(resourceEffect);
        }
      }
    }

    for (let resource of ordered) {
      const { definition, instance } = resource;

      const method = definition?.methods?.[methodName];
      if (!method) continue;

      if (method.implies?.length) {
        for (let implied of method.implies) {
          const plan = await this.planMethod(implied, {
            resources: [resource],
            config,
          });
          results.push(...(plan?.effects ?? []));
        }
      }
      console.log(
        `planning ${yellow(`[${methodName}]`)} on ${resourceId(instance)}${
          options?.description ? " " + options.description : ""
        }:`
      );
      const oldAnswers = instance?.inputs?.[methodName];
      const input = await promise(
        method.inputs?.({
          defaults: { ...defaults, ...oldAnswers },
          questionGenerator: getResourceQuestionGenerator(config),
          resource,
          config,
        })
      );

      if (input && Object.keys(input).length) {
        const pendingResourceRefs = getPendingResourceReferences(input) ?? [];
        for (let ref of pendingResourceRefs) {
          console.log("");
          const newResourcePlan = await this.planCreateResource(
            ref.entity.$resource,
            {
              config,
              description: `for ${resourceId(instance)}.${ref.path.join(".")}`,
            }
          );
          const [newInstance, ...restOfNewPlan] = newResourcePlan.effects;
          if (newInstance) {
            const n = newInstance as ResourceEffect.Create;
            ref.entity.$resource = resourceId(n.instance);
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
            const r: ResourceEffect.OutputEffect = {
              $effect: "resource-effect",
              methodName,
              resourceId: resourceId(resource.instance),
              path,
              effect: entity,
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
