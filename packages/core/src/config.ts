// import { findAncestorPath } from "./util/findAncestorPath";
import path from "path";
import { Plugin, Resource } from "@fx/plugin";
import { cosmiconfig } from "cosmiconfig";
import TypeScriptLoader from "@endemolshinegroup/cosmiconfig-typescript-loader";
import { Project } from "./project";
import { ProjectFile } from ".";

export type Config = {
  plugins?: Plugin[];
};

export type LoadedConfig = Config & {
  configFilePath: string;
  project: Project;
  projectFile: ProjectFile;
  getResourceDefinitionByType(type: string): Resource | null;
  getAllResourceDefinitions(): Resource[];
};

export type ConfigLoaderOptions =
  | {
      cwd: string;
    }
  | { configFile: string };

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
      ".ts": TypeScriptLoader,
    },
  });
  async load(options?: ConfigLoaderOptions): Promise<LoadedConfig> {
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
        const { plugins } = file.config as Config;
        const allResources: Resource[] = [];
        const resourcesByPlugin = new Map<Plugin, Resource[]>();
        const resourcesByType = new Map<
          string,
          { plugin: Plugin; resource: Resource }
        >();
        for (let plugin of plugins ?? []) {
          const resources = await plugin.resources();
          resourcesByPlugin.set(plugin, resources);
          for (let resource of resources) {
            resourcesByType.set(resource.name, { resource, plugin });
            allResources.push(resource);
          }
        }
        const projectFile = new ProjectFile({
          projectFolder: path.dirname(file.filepath),
        });
        try {
          await projectFile.load();
        } catch (err) {
          // suppress whatever load failure we get
        }
        const loaded: LoadedConfig = {
          configFilePath: file.filepath,
          project: projectFile.parsed!,
          projectFile,
          ...(file.config as Config),
          getResourceDefinitionByType(type: string) {
            return resourcesByType.get(type)?.resource ?? null;
          },
          getAllResourceDefinitions() {
            return [...allResources];
          },
        };
        return loaded;
      } else throw new Error("fx project configuration file not found");
    } else {
      throw new Error("either cwd or configFile must be specifed");
    }
  }
}

// const file = await findAncestorPath(CONFIG_FILE_NAME);
// if (!file) return null;
// const configmodule = await import(file);
// const config: Config = configmodule?.["default"] ?? configmodule;
// for (let p of config.plugins ?? []) {
//   const resources = await (p as Plugin).resources();
//   resources.forEach((resource) => {
//     this.resourcesByType.set(resource.name, {
//       plugin: p,
//       resource,
//     });
//   });
// }
// this.config = { ...config, rootPath: path.dirname(file) };
// return this.config;
