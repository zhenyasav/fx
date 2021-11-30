import path from "path";
import { promises as fs } from "fs";
import { Plugin, ResourceDefinition } from "./plugin.js";
import { Effect, handler } from "./effects.js";

const CONFIG_FILE_NAME = `.fx.js`;

export type Config = {
  plugins?: Plugin[];
};

export type ResourceByTypeMap = Map<
  string,
  { plugin: Plugin; resource: ResourceDefinition }
>;

export class Fx {
  private config: Config | null = null;
  private configPromise: Promise<Config | null> | null = null;
  private resourcesByType: ResourceByTypeMap = new Map();
  private async findConfigFile(): Promise<string | null> {
    let cd = process.cwd();
    while (cd && cd.split("/").length) {
      try {
        const exists = await fs.stat(path.resolve(cd, CONFIG_FILE_NAME));
        if (exists) {
          return path.resolve(cd, CONFIG_FILE_NAME);
        }
      } catch (err) {}
      cd = path.dirname(cd);
    }
    return null;
  }
  private async loadConfig(): Promise<Config | null> {
    if (this.config) return this.config;
    if (this.configPromise) return await this.configPromise;
    return await (this.configPromise = new Promise<Config | null>(
      async (resolve) => {
        const file = await this.findConfigFile();
        if (!file) return resolve({});
        const configmodule = await import(file);
        const config: Config = configmodule?.["default"] ?? configmodule;
        for (let p of config.plugins ?? []) {
          const resources = await p.resourceDefinitions();
          resources.forEach((resource) => {
            this.resourcesByType.set(resource.type, {
              plugin: p,
              resource,
            });
          });
        }
        resolve(config);
      }
    ));
  }
  private async getResource(type: string): Promise<ResourceDefinition | null> {
    await this.loadConfig();
    return this.resourcesByType.get(type)?.resource ?? null;
  }
  async getAllResources(): Promise<ResourceByTypeMap> {
    await this.loadConfig();
    return this.resourcesByType;
  }
  private async invokeEffects(
    effects: Effect[] | undefined,
    dryRun = true,
    caption: string
  ) {
    if (caption)
      console.info(`${dryRun ? "dry run" : "executing"}: ${caption}`);
    if (effects) {
      console.info(`${effects.length} actions:`);
      if (dryRun) {
        effects?.forEach((effect) =>
          console.log(handler(effect).describe(effect))
        );
      } else {
        await Promise.all(
          effects?.map((effect) => {
            const h = handler(effect);
            console.log(h.describe(effect));
            return h.apply(effect);
          })
        );
      }
    } else {
      console.log("nothing to do");
    }
  }
  async createResource(type: string, name: string, dryRun = true) {
    await this.loadConfig();
    const resource = await this.getResource(type);
    const effects = await resource?.create({
      inputs: {
        name,
      },
    });
    await this.invokeEffects(
      effects,
      dryRun,
      `create '${type}' named '${name}'`
    );
  }
}
