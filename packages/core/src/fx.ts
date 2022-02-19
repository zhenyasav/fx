import {
  resourceId,
  promise,
  LoadedResource,
  getPendingResourceReferences,
  MethodResult,
  getEffectLocations,
  Effect,
  // getResourceDependencies,
  ResourcePlan,
  ResourceEffect,
  Plan,
  LoadedConfiguration,
} from "@fx/plugin";
import { randomString } from "./util/random";
import { getEffector } from "./effectors";
import { ConfigLoaderOptions, ConfigLoader } from "./config";
import {
  getResourceQuestionGenerator,
  getDependencyGraph,
} from "./resourceDeps";
import { ResourceInstance } from "@fx/plugin";
import { solve } from "dependency-solver";

export type FxOptions = ConfigLoaderOptions & {
  aadAppId?: string;
};

// function isResourceEffect(
//   o: ResourceEffect<Effect.Any>
// ): o is ResourceEffect<Effect.Resource> {
//   return o.effect.$effect == "resource";
// }

export class Fx {
  private options: FxOptions;
  private _config: LoadedConfiguration | null = null;
  private configLoader: ConfigLoader;
  constructor(options?: FxOptions) {
    this.options = { cwd: process.cwd(), ...options };
    this.configLoader = new ConfigLoader();
  }
  public async config() {
    return (
      this._config ??
      (this._config = await this.configLoader.load(this.options))
    );
  }
  async getResourcesWithMethod(methodName: string): Promise<LoadedResource[]> {
    const config = await this.config();
    const resources = config?.getResources();
    return resources?.filter(
      (r) => r.definition?.methods && methodName in r.definition.methods
    );
  }
  async printPlan(effects: Plan): Promise<string[]> {
    const config = await this.config();
    const desc = effects.map((e) => {
      const effector = getEffector(e.effect);
      return effector.describe(e, { config });
    });
    return desc;
  }
  async executePlan(effects: Plan) {
    const config = await this.config();
    for (let i in effects) {
      const effect = effects[i];
      const effector = getEffector(effect.effect);
      console.debug("applying", effector.describe(effect, { config }));
      const result = await effector.apply(effect, { config });
      // commit result to state
      const { resource, method, path } = effect.origin;
      config.setMethodResult(resource, method, path ?? [], result);
      await config.projectFile.save();
    }
  }
  async planMethod(
    methodName: string,
    options?: {
      resource?: LoadedResource;
      input?: { [k: string]: any };
      config?: LoadedConfiguration;
    }
  ): Promise<Plan> {
    const { resource, input: args } = { ...options };
    const resources: LoadedResource[] = resource
      ? [resource]
      : await this.getResourcesWithMethod(methodName);
    if (!resources?.length) return [];

    const results: ResourceEffect<Effect.Any>[] = [];
    const config = options?.config ?? (await this.config()).clone();

    function orderResources(resources: LoadedResource[]): LoadedResource[] {
      if (methodName == "create") {
        return resources;
      }
      const dependencyGraph = getDependencyGraph({
        resources,
        methodName: "create",
      });
      if (dependencyGraph.errors.length) {
        throw new Error(dependencyGraph.errors.join(", "));
      }
      const sequence = solve(dependencyGraph.graph);
      return sequence.map((id) => config.getResource({ $resource: id })!);
    }

    const ordered =
      resources?.length > 1 ? orderResources(resources) : resources;

    for (let resource of ordered) {
      const { definition, instance } = resource;

      const method = definition?.methods?.[methodName];
      if (!method) continue;

      if (method.implies?.length) {
        const impliedMethodPlans = [];
        for (let implied of method.implies) {
          const plan = await this.planMethod(implied, {
            resource,
            config,
          });
          impliedMethodPlans.push(...plan);
        }
        results.push(...impliedMethodPlans);
      }

      const input = await promise(
        method.inputs?.({
          defaults: args,
          questionGenerator: getResourceQuestionGenerator(config),
          resource,
          config,
        })
      );

      if (input && Object.keys(input).length) {
        const pendingResourceRefs = getPendingResourceReferences(input) ?? [];
        for (let ref of pendingResourceRefs) {
          console.log(
            `Creating '${ref.entity.$resource}' for ${resourceId(
              instance
            )}.${ref.path.join(".")}:`
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
        instance.inputs = instance.inputs || {};
        instance.inputs[methodName] = input;
      }

      const existing = config.getResource({ $resource: resourceId(instance) });
      if (
        !existing ||
        JSON.stringify(existing.instance.inputs?.[methodName]) !=
          JSON.stringify(instance.inputs?.[methodName])
      ) {
        const resourceEffect: ResourceEffect = {
          effect: {
            $effect: "resource",
            instance,
          },
          origin: {
            method: methodName,
            resource: resource.instance,
          },
        };
        results.push(resourceEffect);
        config.setResource(instance);
      }

      const methodResult = await promise<MethodResult>(
        method.body?.({
          input,
          resource,
          config,
        })
      );

      if (methodResult) {
        const effectLocations = getEffectLocations(methodResult);
        results.push(
          ...effectLocations.map((loc) => {
            const { entity, path } = loc;
            const r: ResourceEffect = {
              effect: entity,
              origin: {
                method: methodName,
                resource: resource.instance,
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
  async planCreateResource<TInput extends object>(
    type: string,
    options?: { input?: TInput; config?: LoadedConfiguration }
  ): Promise<ResourcePlan<TInput>> {
    const conf = options?.config ?? (await this.config());
    const definition = conf.getResourceDefinition(type);
    if (!definition) throw new Error(`resource of type '${type}' not found`);
    const instance: ResourceInstance = {
      id: randomString(),
      type,
    };
    return this.planMethod("create", {
      resource: { instance, definition },
      input: options?.input,
      config: conf,
    }) as Promise<ResourcePlan<TInput>>;
  }
}
