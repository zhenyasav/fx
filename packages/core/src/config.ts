import path from "path";
import {
  Plugin,
  ResourceDefinition,
  LoadedConfig,
  Config,
  ProjectFile,
  resourceId,
} from "@fx/plugin";
import { cosmiconfig } from "cosmiconfig";
import TypeScriptLoader from "@endemolshinegroup/cosmiconfig-typescript-loader";

export type ConfigLoaderOptions = {
  cwd?: string;
  configFile?: string;
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
          projectFolder: path.dirname(file.filepath),
        });
        try {
          await projectFile.load();
        } catch (err) {
          // suppress whatever load failure we get
        }
        projectFile.parsed = { resources: [], ...projectFile.parsed };
        const loaded: LoadedConfig = {
          configFilePath: file.filepath,
          project: projectFile.parsed,
          projectFile,
          ...(file.config as Config),
          getResourceDefinition(type: string) {
            return defsByType.get(type)?.definition ?? null;
          },
          getResourceDefinitions() {
            return [...allDefs];
          },
          getResources() {
            return (
              projectFile.parsed?.resources?.map((r) => {
                const definition = defsByType.get(r.type)?.definition;
                return {
                  instance: r,
                  definition,
                };
              }) ?? []
            );
          },
          getResource({ $resource }) {
            return (
              this.getResources()?.find(
                (lr) => resourceId(lr.instance) == $resource
              ) ?? null
            );
          },
        };
        return loaded;
      } else throw new Error("fx project configuration file not found");
    } else {
      throw new Error("either cwd or configFile must be specifed");
    }
  }
}
