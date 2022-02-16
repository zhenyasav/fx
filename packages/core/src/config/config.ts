import path from "path";
import {
  Plugin,
  ResourceDefinition,
  Config,
  ProjectFile,
  LoadedProjectConfig,
  resourceId,
  ResourceInstance,
  Project,
  FRAMEWORK_FOLDER,
  PROJECT_FILE_NAME,
} from "@fx/plugin";
import { cosmiconfig } from "cosmiconfig";
import tsloader from "@endemolshinegroup/cosmiconfig-typescript-loader";
// import { swcLoader } from "./swcLoader";

export type ConfigLoaderOptions = {
  cwd?: string;
  configFile?: string;
};

// const swcloader = swcLoader();

export type LoadConfigResult = {
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
  async load(options?: ConfigLoaderOptions): Promise<LoadedProjectConfig> {
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
        return await loadProjectConfig({
          config: file.config,
          filepath: file.filepath,
          isEmpty: file.isEmpty ?? false,
        });
      } else throw new Error("fx project configuration file not found");
    } else {
      throw new Error("either cwd or configFile must be specifed");
    }
  }
}

export async function loadProjectConfig(
  config: LoadConfigResult
): Promise<LoadedProjectConfig> {
  const { plugins } = config.config;
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
  const projectFile = new ProjectFile({
    projectFolder: path.dirname(config.filepath),
  });
  try {
    await projectFile.load();
  } catch (err) {
    // suppress whatever load failure we get
  }
  const loaded: LoadedProjectConfig = {
    ...(config.config as Config),
    projectFile,
    configFilePath: config.filepath,
    get project() {
      return this.projectFile?.parsed ?? { resources: [] };
    },
    set project(p: Project) {
      this.projectFile.parsed = p;
    },
    getResourceDefinition(type: string) {
      return defsByType.get(type)?.definition;
    },
    getResourceDefinitions() {
      return [...allDefs];
    },
    getResources() {
      return (
        this.project.resources?.map((r) => {
          const definition = defsByType.get(r.type)?.definition;
          return {
            instance: r,
            definition,
          };
        }) ?? []
      );
    },
    getResource({ $resource }) {
      return this.getResources()?.find(
        (lr) => resourceId(lr.instance) == $resource
      );
    },
    setResource(instance: ResourceInstance) {
      const { project } = this;
      const existingIndex = project?.resources?.findIndex(
        (r) => resourceId(r) == resourceId(instance)
      );
      if (existingIndex >= 0) {
        project.resources.splice(existingIndex, 1, instance);
      } else {
        project.resources.push(instance);
      }
      return instance;
    },
    clone() {
      const { project, projectFile, ...rest } = this;
      const pf = new ProjectFile({
        projectFolder: path.dirname(config.filepath),
      });
      pf.parsed = JSON.parse(JSON.stringify(projectFile.parsed));
      return { project: pf.parsed!, projectFile: pf, ...rest };
    },
  };
  return loaded;
}
