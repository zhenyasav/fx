import path from "path";
import {
  Plugin,
  ResourceDefinition,
  Config,
  ProjectFile,
  resourceId,
  ResourceInstance,
  Project,
  LoadedResource,
  LoadedConfiguration
} from "@fx/plugin";
import { cosmiconfig } from "cosmiconfig";
import tsloader from "@endemolshinegroup/cosmiconfig-typescript-loader";

// import { swcLoader } from "./swcLoader";

export type ConfigLoaderOptions = {
  cwd?: string;
  configFile?: string;
};

// const swcloader = swcLoader();

type LoadConfigResult = {
  config: Config;
  filepath: string;
  isEmpty: boolean;
};


export class ConfigLoader {
  private cosmiconfig = cosmiconfig("fx", {
    searchPlaces: [
      `.#.json`,
      `.#.yaml`,
      `.#.yml`,
      `.#.ts`,
      `.#.js`,
      `.#rc`,
      `.#rc.json`,
      `.#rc.yaml`,
      `.#rc.yml`,
      `.#rc.ts`,
      `.#rc.js`,
      `#.config.ts`,
      `#.config.js`,
      "package.json",
    ].map((s) => s.replace("#", "fx")),
    loaders: {
      ".ts": tsloader,
      // ".ts": swcloader,
    },
  });
  async loadConfig(
    options?: ConfigLoaderOptions
  ): Promise<LoadConfigResult | undefined> {
    const { cwd, configFile } = {
      cwd: process.cwd(),
      configFile: null,
      ...options,
    };
    if (configFile || cwd) {
      const file = configFile
        ? await this.cosmiconfig.load(configFile)
        : await this.cosmiconfig.search(cwd);
      if (file) {
        const { config, filepath, isEmpty } = file;
        return { config: config as Config, filepath, isEmpty: !!isEmpty };
      }
    }
  }
  async load(options?: ConfigLoaderOptions): Promise<LoadedConfiguration> {
    const { cwd, configFile } = {
      cwd: process.cwd(),
      configFile: null,
      ...options,
    };
    if (configFile || cwd) {
      const file = configFile
        ? await this.cosmiconfig.load(configFile)
        : await this.cosmiconfig.search(cwd);
      if (file) {
        return getProjectApi({
          config: file.config,
          configFilePath: file.filepath,
        });
      } else throw new Error("fx project configuration file not found");
    } else {
      throw new Error("either cwd or configFile must be specifed");
    }
  }
}

export async function getProjectApi(options: {
  config: Config;
  configFilePath: string;
}): Promise<LoadedConfiguration> {
  const { configFilePath, config } = options;
  const { plugins } = config;
  const allDefs: ResourceDefinition[] = [];
  const defsByPlugin = new Map<Plugin, ResourceDefinition[]>();
  const defsByType = new Map<
    string,
    { plugin: Plugin; definition: ResourceDefinition }
  >();
  for (let plugin of plugins ?? []) {
    const defs = await plugin.resources();
    defsByPlugin.set(plugin, defs);
    for (let def of defs) {
      defsByType.set(def.type, { definition: def, plugin });
      allDefs.push(def);
    }
  }
  const projectFile: ProjectFile = new ProjectFile({
    projectFolder: path.dirname(configFilePath),
  });

  projectFile.content = { resources: [] };
  
  try {
    await projectFile.load();
  } catch (err) {}

  const api: LoadedConfiguration = {
    config,
    configFilePath,
    projectFile,
    get project(): Project {
      return this.projectFile.content!;
    },
    getResourceDefinitions(): ResourceDefinition[] {
      return [...allDefs];
    },
    getResourceDefinition(type: string) {
      return defsByType.get(type)?.definition;
    },
    getResources(): LoadedResource[] {
      const { resources } = this.project;
      return (
        resources?.map((r) => {
          const definition = this.getResourceDefinition(r.type);
          return {
            instance: r,
            definition,
          };
        }) ?? []
      );
    },
    getResource({ $resource }): LoadedResource | undefined {
      return this.getResources()?.find(
        (lr) => resourceId(lr.instance) == $resource
      );
    },
    setResource(instance): ResourceInstance {
      const { resources } = this.project;
      const existingIndex = resources.findIndex(
        (r) => resourceId(r) == resourceId(instance)
      );
      if (typeof existingIndex == "number" && existingIndex >= 0) {
        resources.splice(existingIndex, 1, instance);
      } else {
        resources.push(instance);
      }
      return instance;
    },
    clone(): LoadedConfiguration {
      const { projectFile, ...rest } = this;
      const clone = projectFile.clone() as ProjectFile;
      return { ...rest, projectFile: clone };
    },
  };
  return api;
}
