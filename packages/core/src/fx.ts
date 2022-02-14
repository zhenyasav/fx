import {
  resourceId,
  promise,
  LoadedResource,
  LoadedConfig,
  getPendingResourceReferences,
  MethodResult,
  getEffectLocations,
  Effect,
  getResourceDependencies,
  ResourceEffect,
} from "@fx/plugin";
import { randomString } from "./util/random";
// import { compact } from "./util/collections";
import { getEffector } from "./effectors";
import { ConfigLoaderOptions, ConfigLoader } from "./config";
import { getResourceQuestionGenerator } from "./resourceDeps";
import { ResourceInstance } from "@fx/plugin/build/resource";

// import { timer } from "./util/timer";

export type FxOptions = ConfigLoaderOptions & {
  aadAppId?: string;
};

export class Fx {
  private options: FxOptions;
  private _config: LoadedConfig | null = null;
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
  printEffects(effects: ResourceEffect<Effect.Any>[]): string {
    const desc = effects
      .map((e) => {
        const effector = getEffector(e.effect);
        return effector.describe(e, {});
      })
      .join("\n");
    return desc;
  }
  async executeEffects(effects: ResourceEffect<Effect.Any>[]) {}
  async planMethod(
    methodName: string,
    resource?: LoadedResource,
    args?: { [k: string]: any }
  ): Promise<ResourceEffect<Effect.Any>[]> {
    const resources = resource
      ? [resource]
      : await this.getResourcesWithMethod(methodName);
    if (!resources?.length) return [];

    const results: ResourceEffect<Effect.Any>[] = [];
    const config = await this.config();

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
          }
          results.push(newInstance, ...restOfNewPlan);
        }
        instance.inputs = instance.inputs || {};
        instance.inputs[methodName] = input;
        results.push({
          effect: {
            $effect: "resource",
            instance,
          },
          origin: {
            method: methodName,
            resource: resource.instance,
          },
        });
      }

      if (methodName != 'create') {
        const dependencies = getResourceDependencies(instance);
        for (let dep of dependencies) {
          const dependentResource = config.getResource(dep);
          const alreadyPlanned =
            !!dependentResource &&
            plannedResourceMethods.get(dependentResource)?.[methodName];
          if (alreadyPlanned) continue;
          const dependentPlan = await this.planMethod(
            methodName,
            dependentResource
          );
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
  ): Promise<
    [ResourceEffect<Effect.Resource<TInput>>, ...ResourceEffect<Effect.Any>[]]
  > {
    const config = await this.config();
    const definition = config.getResourceDefinition(type);
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
        },
      },
      ...(await this.planMethod("create", { instance, definition }, input)),
    ];
  }
  // async createResource(
  //   type: string,
  //   inputs?: { name?: string },
  //   dryRun = false
  // ) {
  //   const config = await this.config();
  //   const definition = config.getResourceDefinition(type);
  //   if (!definition) throw new Error("resource type not found");
  //   const instance: ResourceInstance = {
  //     id: randomString(),
  //     type,
  //     inputs: inputs,
  //     outputs: {},
  //   };
  //   if ("create" in (definition?.methods ?? {})) {
  //     await this.invokeResourceMethod(
  //       {
  //         instance,
  //         definition,
  //       },
  //       "create",
  //       {
  //         dryRun,
  //         defaultArgs: inputs,
  //       }
  //     );
  //   }
  //   if (!dryRun) {
  //     config.project.resources.push(instance);
  //     await config.projectFile.save();
  //   }
  //   return instance;
  // }
  // async invokeMethodOnAllResources(methodName: string) {
  // const resources = await this.getResourcesWithMethod(methodName);
  // if (!resources) return;
  // resources.forEach((res) => {
  //   console.log(`invoking ${res.instance.type}.${methodName}`);
  //   this.invokeResourceMethod(res, methodName);
  // });
  // }
  // async invokeResourceMethod(
  //   resource: LoadedResource,
  //   methodName: string,
  //   options?: { dryRun: boolean; defaultArgs?: any }
  // ) {
  //   const { dryRun, defaultArgs } = { dryRun: false, ...options };
  //   const { definition, instance } = resource;
  //   if (!definition)
  //     throw new Error(`resoure definition not found for ${instance?.type}`);
  //   const method = definition.methods?.[methodName];
  //   if (!method)
  //     throw new Error(
  //       `the resource ${instance?.type}(${instance?.id}) has no method ${methodName}`
  //     );
  //   const config = await this.config();
  //   const input = await promise(
  //     method.inputs?.({
  //       defaults: defaultArgs,
  //       questionGenerator: getResourceQuestionGenerator(config),
  //       resource,
  //       config,
  //     })
  //   );
  //   if (input) {
  //     const pendingResourceRefs = getPendingResourceReferences(input) ?? [];
  //     for (let ref of pendingResourceRefs) {
  //       console.log(`Creating a ${ref.$resource}:`);
  //       const resourceInstance = await this.createResource(ref.$resource);
  //       if (resourceInstance) {
  //         ref.$resource = resourceId(resourceInstance);
  //       }
  //     }
  //     instance.inputs = instance.inputs || {};
  //     instance.inputs[methodName] = input;
  //   }

  //   const methodResult = await promise<MethodResult>(
  //     method.body?.({
  //       input,
  //       resource,
  //       config,
  //     })
  //   );

  //   if (methodResult) {
  //     const effects = getEffects(methodResult);
  //     if (effects.length) {
  //       console.log(printEffects(effects?.map((e) => e.effect)) + "\n");
  //       if (!dryRun) {
  //         (await applyEffects(effects?.map((e) => e.effect)))?.forEach(
  //           (r, i) => {
  //             const key = effects[i].path[0];
  //             methodResult[key] = r;
  //           }
  //         );
  //       }
  //     }
  //     if (!dryRun) {
  //       instance.outputs = instance.outputs || {};
  //       instance.outputs[methodName] = methodResult;
  //       const config = await this.config();
  //       await config.projectFile.save();
  //     }
  //   }

  //   return methodResult;
  // }
}
