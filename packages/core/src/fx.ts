import { promise, ResourceDefinition } from "@fx/plugin";
import { randomString } from "./util/random";
import { safe, timed } from "./util";
import { ConfigLoader } from "./config";
import { applyEffects, printEffects } from "./effectors";
import { ConfigLoaderOptions, LoadedConfig } from "./config";

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
  async createResource(
    type: string,
    inputs?: { name?: string },
    dryRun = true
  ) {
    safe(async () => {
      const config = await this.config();
      const resource = config.getResourceDefinitionByType(type);
      if (!resource) throw new Error("resource type not found");
      const input = await promise(
        resource.methods.create.getInput?.(inputs ?? {})
      );
      await timed(async () => {
        const createResult = await promise(
          resource.methods.create.execute?.({
            input,
          })
        );
        const { effects, value, description } = {
          effects: [],
          value: null,
          description: `create ${type}${
            !!inputs?.name ? ` named '${inputs.name}'` : ""
          }`,
          ...createResult,
        };
        if (effects) {
          if (dryRun) {
            printEffects(effects, description);
          } else {
            await applyEffects(effects, description);
          }
        }
        if (!dryRun) {
          config.project.resources.push({
            type,
            id: randomString(),
            input,
            ...(value ? { output: value } : {})
          });
          await config.projectFile.save();
        }
        
      });
    });
  }
  async getResourceDefinitionsInProject(
    predicate?: (res: ResourceDefinition) => boolean
  ) {
    const config = await this.config();
    return config.project.resources.reduce<ResourceDefinition[]>((memo, instance) => {
      const res = config.getResourceDefinitionByType(instance.type);
      if (res && (!predicate || predicate?.(res))) memo.push(res);
      return memo;
    }, []);
  }
  async getResourcesInProjectWithMethod(methodName: string) {
    return this.getResourceDefinitionsInProject((resource) => {
      return methodName in resource.methods;
    });
  }
  async invokeMethod(methodName: string, ...args: any[]) {
    const resources = await this.getResourcesInProjectWithMethod(methodName);
    if (!resources) return;
    resources.forEach((res) => {
      console.log('invoking', res.type, methodName);
    });
  }
}
