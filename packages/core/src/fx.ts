import * as path from "path";
import mkdirp from "mkdirp";
import { promises as fs } from "fs";
import { Plugin, ResourceDefinition } from "@fx/plugin";
import {
  randomString,
  safelyTimed,
  promiseOnce,
  findAncestorPath,
} from "@fx/util";
import { applyEffects } from "./handlers.js";

const CONFIG_FILE_NAME = ".fx.js";
const FRAMEWORK_FOLDER = ".fx";
const PROJECT_FILE = "project.json";

export type Config = {
  plugins?: Plugin[];
};

type LoadedConfig = Config & {
  rootPath: string;
};

export type ResourceByTypeMap = Map<
  string,
  { plugin: Plugin; resource: ResourceDefinition }
>;

export type ResourceInstance = {
  type: string;
  input: any;
  id: string;
};

export type Project = {
  resources: ResourceInstance[];
};

export class Fx {
  private config: LoadedConfig | null = null;
  private project: Project | null = null;
  private resourcesByType: ResourceByTypeMap = new Map();
  constructor() {
    this.loadConfig = promiseOnce(this.loadConfig.bind(this));
  }
  private async loadProject(): Promise<Project | null> {
    const c = await this.loadConfig();
    if (!c) throw new Error("unable to locate .fx.js config file");
    const folder = path.join(c.rootPath, FRAMEWORK_FOLDER);
    if (!folder) return null;
    let raw: string;
    try {
      raw = (await fs.readFile(path.resolve(folder, PROJECT_FILE))).toString();
    } catch (err) {
      raw = "";
    }
    try {
      const project: Project = raw
        ? (JSON.parse(raw) as Project)
        : {
            resources: [],
          };
      this.project = project;
      return project;
    } catch (err) {
      throw new Error("failed to parse fx project file");
    }
  }
  private async ensureProject(): Promise<Project | null> {
    await this.loadConfig();
    await this.loadProject();
    if (!this.project && !!this.config) {
      const { rootPath } = this.config;
      await mkdirp(path.resolve(rootPath, FRAMEWORK_FOLDER));
      const content = JSON.stringify(
        {
          resources: [],
        },
        null,
        2
      );
      await fs.writeFile(
        path.resolve(rootPath, FRAMEWORK_FOLDER, PROJECT_FILE),
        content
      );
    }
    return await this.loadProject();
  }
  private async loadConfig(): Promise<LoadedConfig | null> {
    const file = await findAncestorPath(CONFIG_FILE_NAME);
    if (!file) return null;
    const configmodule = await import(file);
    const config: Config = configmodule?.["default"] ?? configmodule;
    for (let p of config.plugins ?? []) {
      const resources = await (p as Plugin).resourceDefinitions();
      resources.forEach((resource) => {
        this.resourcesByType.set(resource.type, {
          plugin: p,
          resource,
        });
      });
    }
    this.config = { ...config, rootPath: path.dirname(file) };
    return this.config;
  }
  private async getResourceDefinition(
    type: string
  ): Promise<ResourceDefinition | null> {
    await this.loadConfig();
    return this.resourcesByType.get(type)?.resource ?? null;
  }
  async getAllResourceDefinitions(): Promise<ResourceByTypeMap> {
    await this.loadConfig();
    return this.resourcesByType;
  }
  private addResourceToProject(
    project: Project,
    resourceResult: ResourceInstance
  ) {
    project.resources = project.resources || [];
    project.resources.push(resourceResult);
    return project;
  }
  private async saveProject(project: Project) {
    const config = await this.loadConfig();
    if (!config)
      throw new Error("unable to save project, config file not found");
    const dir = path.resolve(config?.rootPath, FRAMEWORK_FOLDER);
    await mkdirp(dir);
    const file = path.resolve(dir, PROJECT_FILE);
    await fs.writeFile(file, JSON.stringify(project, null, 2));
  }
  async createResource(
    type: string,
    inputs?: { name?: string },
    dryRun = true
  ) {
    safelyTimed(async () => {
      const resource = await this.getResourceDefinition(type);
      if (!resource) throw new Error("resource type not found");
      let project: Project | null = null;
      if (!dryRun) {
        project = await this.ensureProject();
        if (!project) throw new Error("unable to create a project file");
      }
      const createdResource = await resource.create({
        input: inputs ?? {},
      });
      const { effects, description } = createdResource;
      if (effects) {
        await applyEffects(
          effects,
          dryRun,
          description
            ? `create ${description}`
            : `create ${type}${!!inputs?.name ? ` named '${inputs.name}'` : ""}`
        );
      }
      if (!dryRun && !!project) {
        const p = this.addResourceToProject(project, {
          type,
          input: createdResource.input,
          id: randomString(),
        });
        await this.saveProject(p);
      }
    });
  }
}
