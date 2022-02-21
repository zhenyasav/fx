import path from "path";
import {
  resourceId,
  promise,
  LoadedResource,
  getPendingResourceReferences,
  MethodResult,
  getEffectLocations,
  Effect,
  ResourcePlan,
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
import { yellow } from "chalk";
import { patchTsConfigForTsNode } from "./util/tsconfig";
import { uniq } from "./util/collections";
import { cyan } from "chalk";

const clone = (o: any) => JSON.parse(JSON.stringify(o));

function isResourceEffect(
  o: ResourceEffect<Effect.Any>
): o is ResourceEffect<Effect.Resource> {
  return o && o.effect?.$effect == "resource";
}

export type FxOptions = ConfigLoaderOptions;

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
  async printPlan(effects: Plan): Promise<string[]> {
    const config = await this.config();
    const desc = effects.map((e) => {
      const effector = getEffector(e.effect);
      return (
        (e.origin ? cyan(e.origin.resourceId) + " " : "") +
        effector.describe(e, { config })
      );
    });
    return desc;
  }
  async executePlan(effects: Plan) {
    const config = await this.config();
    const createdResources = [];
    for (let i in effects) {
      const effect = effects[i];
      const effector = getEffector(effect.effect);
      console.log("applying", effector.describe(effect, { config }));
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
  public async planInit(options?: { selector?: string }): Promise<Plan> {
    const { selector } = { ...options };
    if (selector) {
      // init resource
      // const config = await this.requireConfig();
      return [];
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
        const filesPlan: Plan = files.map((file) => ({
          effect: {
            $effect: "file",
            file,
          },
        }));
        return [
          ...filesPlan,
          {
            effect: {
              description: "add @fx/core to dev dependencies",
              $effect: "shell",
              command: "npm i -D @fx/core",
            },
          },
        ];
      } else {
        throw new Error("failed to create fx project");
      }
    }
  }
  async planCreateResource<TInput extends object>(
    type: string,
    options?: { input?: TInput; config?: LoadedConfiguration }
  ): Promise<ResourcePlan<TInput>> {
    const conf = options?.config ?? (await this.requireConfig());
    const definition = conf.getResourceDefinition(type);
    if (!definition) throw new Error(`resource of type '${type}' not found`);
    const instance: ResourceInstance = {
      id: randomString(),
      type,
    };
    return [
      {
        effect: {
          $effect: "resource",
          instance,
          description: `create ${resourceId(instance)}`,
        },
        origin: {
          resourceId: resourceId(instance),
          method: "create",
        },
      },
      ...(await this.planMethod("create", {
        resource: { instance, definition },
        input: options?.input,
        config: conf,
      })),
    ] as ResourcePlan<TInput>;
  }
  async planMethod(
    methodName: string,
    options?: {
      resource?: LoadedResource;
      input?: { [k: string]: any };
      config?: LoadedConfiguration;
    }
  ): Promise<Plan> {
    const { resource, input: defaults } = { ...options };
    const resources: LoadedResource[] = resource
      ? [resource]
      : await this.getResourcesWithMethod(methodName);
    if (!resources?.length) return [];

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
        const instanceClone = clone(instance);
        const section = (instanceClone[sectionKey] =
          instanceClone[sectionKey] || {});
        section[methodName] = value;
        const resourceEffect: ResourceEffect = {
          effect: {
            $effect: "resource",
            instance: instanceClone,
          },
          origin: {
            method: methodName,
            resourceId: resourceId(instance),
          },
        };
        results.push(resourceEffect);
        config.setResource(instanceClone);
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
          results.push(...plan);
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
          const [newInstance, ...restOfNewPlan] = newResourcePlan;
          if (newInstance) {
            ref.entity.$resource = resourceId(newInstance.effect.instance);
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

    return results;
  }
}
