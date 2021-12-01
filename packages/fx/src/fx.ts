import path from "path";
import { promises as fs } from "fs";
import { Plugin, ResourceDefinition } from "./plugin.js";
import { Effect, handler } from "./effects.js";
import { timer } from "./timer.js";

const CONFIG_FILE_NAME = `.fx.js`;

export type Config = {
  plugins?: Plugin[];
};

export type ResourceByTypeMap = Map<
  string,
  { plugin: Plugin; resource: ResourceDefinition }
>;

type PromiseFn<R = any> = (...args: any[]) => Promise<R>;

function uniPromise<TFn extends PromiseFn = PromiseFn>(fun: TFn): TFn {
  let promise: Promise<any>;
  let value: any;
  return (async (...args) => {
    if (value) return value;
    if (promise) return promise;
    promise = fun(...args);
    return promise;
  }) as TFn;
}

export type ResourceInstance = {
  plugin: string;
  type: string;
  id: string;
};

export type Project = {
  resources: ResourceInstance[];
}

export class Fx {
  private config: Config | null = null;
  private configPromise: Promise<Config | null> | null = null;
  private resourcesByType: ResourceByTypeMap = new Map();
  constructor() {
    this.loadConfig = uniPromise(this.loadConfig.bind(this));
    this.loadProject = uniPromise(this.loadProject.bind(this));
  }
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
  private async loadProject(): Promise<Project | null> {
    return {
      resources: []
    };
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
    if (caption) console.info(`${dryRun ? "dry run" : "plan"}: ${caption}`);
    console.info("cwd:", process.cwd());
    if (effects) {
      console.info(`\n${effects.length} actions:`);
      if (dryRun) {
        effects?.forEach((effect) =>
          console.log(handler(effect).describe(effect))
        );
      } else {
        const tasks = Promise.all(
          effects?.map((effect) => {
            const h = handler(effect);
            console.log(h.describe(effect));
            return h.apply(effect);
          })
        );
        console.log("\nexecuting ...");
        await tasks;
      }
    } else {
      console.log("nothing to do");
    }
  }
  private async time(fn: () => Promise<void>): Promise<void> {
    const t = timer();
    await fn?.();
    console.info(`done ${t()}\n`);
  }
  async createResource(type: string, name: string, dryRun = true) {
    this.time(async () => {
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
    });
  }
  async runDev(resources: string, dryRun = true) {
    await this.loadConfig();
    // concurrently
  }
}
