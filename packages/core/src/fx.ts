import {
  resourceId,
  promise,
  LoadedResource,
  LoadedProjectConfig,
  getPendingResourceReferences,
  MethodResult,
  getEffectLocations,
  Effect,
  getResourceDependencies,
  ResourcePlan,
  ResourceEffect,
  Plan,
} from "@fx/plugin";
import { randomString } from "./util/random";
import { getEffector } from "./effectors";
import { ConfigLoaderOptions, ConfigLoader } from "./config";
import { getResourceQuestionGenerator } from "./resourceDeps";
import { ResourceInstance } from "@fx/plugin/build/resource";

export type FxOptions = ConfigLoaderOptions & {
  aadAppId?: string;
};

export class Fx {
  private options: FxOptions;
  private _config: LoadedProjectConfig | null = null;
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
  async applyEffect(effect: ResourceEffect) {}
  async executePlan(effects: Plan) {
    const config = await this.config();
    for (let i in effects) {
      const effect = effects[i];
      const effector = getEffector(effect.effect);
      await effector.apply(effect, { config });
    }
  }
  async planMethod(
    methodName: string,
    options?: {
      resource?: LoadedResource;
      input?: { [k: string]: any };
      config?: LoadedProjectConfig;
    }
  ): Promise<Plan> {
    const { resource, input: args } = { ...options };
    const resources = resource
      ? [resource]
      : await this.getResourcesWithMethod(methodName);
    if (!resources?.length) return [];

    const results: ResourceEffect<Effect.Any>[] = [];
    const config = options?.config ?? (await this.config()).clone();
    const plannedResourceMethods = new Map<
      LoadedResource,
      { [methodName: string]: boolean }
    >();

    for (let resource of resources) {
      const { definition, instance } = resource;
      const alreadyPlanned = plannedResourceMethods.get(resource)?.[methodName];
      if (alreadyPlanned) continue;

      const method = definition?.methods?.[methodName];
      if (!method) continue;

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
          console.log(`Creating a ${ref.$resource}:`);
          const newResourcePlan = await this.planCreateResource(ref.$resource);
          const [newInstance, ...restOfNewPlan] = newResourcePlan;
          if (newInstance) {
            ref.$resource = resourceId(newInstance.effect.instance);
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
        
      }

      if (methodName != "create") {
        const dependencies = getResourceDependencies(instance);
        for (let dep of dependencies) {
          const dependentResource = config.getResource(dep);
          const alreadyPlanned =
            !!dependentResource &&
            plannedResourceMethods.get(dependentResource)?.[methodName];
          if (alreadyPlanned) continue;
          const dependentPlan = await this.planMethod(methodName, {
            resource: dependentResource,
            config,
          });
          // TODO: possibly commit all resource effects from the dependent plans
          // too
          results.push(...dependentPlan);
        }
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
            const { effect, path } = loc;
            const r: ResourceEffect = {
              effect,
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
    input?: TInput
  ): Promise<ResourcePlan<TInput>> {
    const config = await this.config();
    const definition = config.getResourceDefinition(type);
    if (!definition) throw new Error(`resource of type '${type}' not found`);
    const instance: ResourceInstance = {
      id: randomString(),
      type,
    };
    return this.planMethod("create", {
      resource: { instance, definition },
      input,
    }) as Promise<ResourcePlan<TInput>>;
  }
}
