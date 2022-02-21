import path from "path";
import {
  Config,
  LoadedConfiguration,
  Plugin,
  ResourceReference,
  ResourceDefinition,
  ProjectFile,
  resourceId,
  ResourceInstance,
  Project,
  LoadedResource,
  scrubEffects,
} from "@fx/plugin";
import { ensurePath } from "../util/objects";

export async function createLoadedConfiguration(options: {
  config: Config;
  configFilePath: string;
}): Promise<LoadedConfiguration> {
  const { configFilePath, config } = options;
  const { plugins, resources } = config;
  const allDefs: ResourceDefinition[] = [];
  const defsByPlugin = new Map<Plugin, ResourceDefinition[]>();
  const defsByType = new Map<
    string,
    { plugin: Plugin; definition: ResourceDefinition }
  >();
  const localPlugin: Plugin = {
    name: "local-resources",
    resources() {
      return resources ?? [];
    },
  };
  const allPlugins = [
    ...(resources?.length ? [localPlugin] : []),
    ...(plugins ?? []),
  ];
  for (let plugin of allPlugins) {
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
    getResource(
      refOrId: string | ResourceReference
    ): LoadedResource | undefined {
      const id = typeof refOrId == "string" ? refOrId : refOrId.$resource;
      return this.getResources()?.find((lr) => resourceId(lr.instance) == id);
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
    setMethodResult(resourceId, method, path, result) {
      const res = this.getResource(resourceId);
      if (!res) return;
      const v = ensurePath(res.instance, ["outputs", method, ...path]);
      const lastKey = path[path.length - 1];
      v[lastKey] = scrubEffects(result);
      return res.instance;
    },
    clone(): LoadedConfiguration {
      const { projectFile, ...rest } = this;
      const clone = projectFile.clone() as ProjectFile;
      return { ...rest, projectFile: clone };
    },
  };
  return api;
}
