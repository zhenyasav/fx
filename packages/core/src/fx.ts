import { promise } from "@fx/plugin";
import { randomString } from "./util/random";
import { safelyTimed } from "./util/safe";
import { ConfigLoader } from "./config";
import { applyEffects, printEffects } from "./effectors";
import { ConfigLoaderOptions, LoadedConfig } from "./config";

export type FxOptions = ConfigLoaderOptions;

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
    safelyTimed(async () => {
      const config = await this.config();
      const resource = config.getResourceDefinitionByType(type);
      if (!resource) throw new Error("resource type not found");
      const input = await promise(
        resource.methods.create.getInput(inputs ?? {})
      );
      const createResult = await promise(
        resource.methods.create.execute({
          input,
        })
      );
      if (createResult) {
        const { effects, value, description } = {
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
            output: value,
          });
          await config.projectFile.save();
        }
      }
    });
  }
}
