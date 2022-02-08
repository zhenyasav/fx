import { promise, ResourceInstance } from "@fx/plugin";
import { randomString } from "./util/random";
import { compact } from "./util/collections";
import { applyEffects, printEffects } from "./effectors";
import {
  ConfigLoaderOptions,
  LoadedConfig,
  LoadedResource,
  ConfigLoader,
} from "./config";

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
      (r) => r.definition?.methods && (methodName in r.definition.methods)
    );
  }
  async invokeMethodOnAllResources(methodName: string) {
    const resources = await this.getResourcesWithMethod(methodName);
    if (!resources) return;
    resources.forEach((res) => {
      console.log(`invoking ${res.instance.type}.${methodName}`);
      this.invokeResourceMethod(res, methodName);
    });
  }
  async invokeResourceMethod(
    resource: LoadedResource,
    methodName: string,
    options?: { dryRun: boolean; defaultArgs?: any }
  ) {
    const { dryRun, defaultArgs } = { dryRun: false, ...options };
    const { definition, instance } = resource;
    if (!definition)
      throw new Error(`resoure definition not found for ${instance?.type}`);
    const method = definition.methods?.[methodName];
    if (!method)
      throw new Error(
        `the resource ${instance?.type}(${instance?.id}) has no method ${method}`
      );
    const input = await promise(method.inputs?.(defaultArgs));
    const methodResult = await promise(
      method.body?.({
        input,
      })
    );
    const { effects, value, description, ...rest } = {
      effects: [],
      value: null,
      description: `${methodName} ${definition.type}${
        !!input?.name ? ` named '${input.name}'` : ""
      }`,
      ...methodResult,
    };
    if (effects?.length) {
      if (dryRun) {
        printEffects(effects, description);
      } else {
        const effectResults = compact(await applyEffects(effects, description));
        if (input) {
          instance.inputs = instance.inputs || {};
          instance.inputs[methodName] = input;
        }
        if (effectResults?.length) {
          instance.outputs = instance.outputs || {};
          instance.outputs[methodName] = effectResults;
        }
        const config = await this.config();
        await config.projectFile.save();
      }
    }
    return { effects, value, description, ...rest };
  }
  async createResource(
    type: string,
    inputs?: { name?: string },
    dryRun = true
  ) {
    const config = await this.config();
    const definition = config.getResourceDefinition(type);
    if (!definition) throw new Error("resource type not found");
    const instance: ResourceInstance = {
      id: randomString(),
      type,
      inputs: inputs,
      outputs: {},
    };
    await this.invokeResourceMethod(
      {
        instance,
        definition,
      },
      "create",
      {
        dryRun,
        defaultArgs: inputs,
      }
    );
    if (!dryRun) {
      config.project.resources.push(instance);
      await config.projectFile.save();
      return instance;
    }
  }
}
