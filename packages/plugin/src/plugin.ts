import path from "path";
import { z } from "zod";
import { inquire, QuestionGenerator } from "@fx/zod-inquirer";
import { MaybePromise } from "./promise";
import { JSONFile } from "@nice/file";
import { ResourceInstance } from "./resource";

export const FRAMEWORK_FOLDER = `.fx`;
export const PROJECT_FILE_NAME = "project.json";

export type Plugin = {
  readonly name: string;
  resources(): MaybePromise<ResourceDefinition[]>;
};

export type Config = {
  plugins?: Plugin[];
};

export type Project = {
  resources: ResourceInstance[];
};

export type LoadedResource<TCreateInput = any, TContext = {}> = {
  instance: ResourceInstance<TCreateInput>;
  definition?: ResourceDefinition<TCreateInput, TContext>;
};

export type ProjectLoadOptions =
  | {
      projectFile: string;
    }
  | { projectFolder: string };

export class ProjectFile extends JSONFile<Project> {
  constructor(options: ProjectLoadOptions) {
    const { projectFile, projectFolder } = {
      projectFolder: process.cwd(),
      projectFile: null,
      ...options,
    };
    const resolvedProjectFileName =
      projectFile ??
      path.resolve(projectFolder, FRAMEWORK_FOLDER, PROJECT_FILE_NAME);
    super({ path: resolvedProjectFileName });
  }
}

export type LoadedConfiguration = {
  config: Config;
  configFilePath: string;
  projectFile: ProjectFile;
  project: Project;
  getResourceDefinitions(): ResourceDefinition[];
  getResourceDefinition(type: string): ResourceDefinition | undefined;
  getResources(): LoadedResource[];
  getResource(ref: ResourceReference): LoadedResource | undefined;
  setResource(instance: ResourceInstance): ResourceInstance;
  clone(): LoadedConfiguration;
};

export type Typed = { type: string };

export type ResourceReference = {
  $resource: string;
};

export function resourceId(instance: ResourceInstance) {
  if (!instance) return `[null]`;
  const { id, type } = instance;
  return `${type}:${id}`;
}

export function isResourceReference(o: any): o is ResourceReference {
  return !!o && typeof o == "object" && "$resource" in o;
}

export function getResourceReferences(object: any) {
  return Object.values(object)?.filter(isResourceReference);
}

export function getPendingResourceReferences(object: any) {
  return getResourceReferences(object)?.filter(
    (ref) => !/:/.test(ref.$resource)
  );
}

export function getResourceDependencies(
  instance: ResourceInstance
): ResourceReference[] {
  if (!instance) return [];
  const result = [];
  for (let m in instance.inputs) {
    const methodResult = instance.inputs[m];
    result.push(...getResourceReferences(methodResult));
  }
  return result;
}

export type MethodResult = void | object;

export type Method<TInput = any, TContext = {}> = {
  inputs?(
    context: {
      defaults?: Partial<TInput>;
      resource: LoadedResource<TInput, TContext>;
      config: LoadedConfiguration;
      questionGenerator?: QuestionGenerator;
    } & TContext
  ): MaybePromise<TInput>;
  body?(
    context: {
      input: TInput;
      resource: LoadedResource<TInput, TContext>;
      config: LoadedConfiguration;
    } & TContext
  ): MaybePromise<MethodResult>;
  requires?: string[];
  implies?: string[];
};

export type Methods<TCreateInput = any, TContext = {}> = {
  create?: Method<TCreateInput, TContext>;
} & { [methodName: string]: Method<any, TContext> };

export type Transform<T, C = any> = (
  t: T,
  context: C
) => { [k in keyof T]: any };

export function method<T extends z.ZodObject<z.ZodRawShape>, TContext = any>({
  inputShape,
  inputTransform,
  ...rest
}: {
  inputShape?: T;
  inputTransform?: Transform<z.infer<T>, TContext>;
  requires?: string[];
  implies?: string[];
} & Pick<Method<z.infer<T>, TContext>, "body">): Method<z.infer<T>, TContext> {
  return inputShape
    ? {
        async inputs(context) {
          const { defaults, questionGenerator } = { ...context };
          const answers = await inquire(inputShape, {
            defaults,
            questionGenerator,
          });
          return inputTransform
            ? inputTransform(answers as any, context)
            : answers;
        },
        ...rest,
      }
    : {
        inputs(context) {
          return inputTransform
            ? inputTransform?.({ ...context?.defaults } as any, context)
            : { ...context?.defaults };
        },
        ...rest,
      };
}

export type ResourceDefinition<TCreateInput = any, TContext = {}> = {
  type: string;
  description?: string;
  methods?: Methods<TCreateInput, TContext>;
};
