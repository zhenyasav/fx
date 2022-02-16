import path from "path";
import { z } from "zod";
import { inquire, QuestionGenerator } from "@fx/zod-inquirer";
import { Effect } from "./effects";
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

export type LoadedProjectConfig = Config & {
  configFilePath: string;
  project: Project;
  projectFile: ProjectFile;
  getResourceDefinitions(): ResourceDefinition[];
  getResourceDefinition(type: string): ResourceDefinition | undefined;
  getResources(): LoadedResource[];
  getResource(ref: ResourceReference): LoadedResource | undefined;
  setResource(instance: ResourceInstance): ResourceInstance;
  clone(): LoadedProjectConfig;
};

export type LoadedResource<TCreateInput = any> = {
  instance: ResourceInstance<TCreateInput>;
  definition?: ResourceDefinition<TCreateInput>;
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

export type MethodResult<TEffect extends Effect.Base = Effect.Any> = void | {
  [k: string]: any | TEffect;
};

export type MethodContext = {
  config: LoadedProjectConfig;
  resource: LoadedResource;
};

export type Method<TInput = any, TEffect extends Effect.Base = Effect.Any> = {
  inputs?(
    context: {
      defaults?: Partial<TInput>;
      questionGenerator?: QuestionGenerator;
    } & MethodContext
  ): MaybePromise<TInput>;
  body?(
    context: {
      input: TInput;
    } & MethodContext
  ): MaybePromise<MethodResult<TEffect>>;
  requires?: string[];
  implies?: string[];
};

export type Methods<TCreateInput = any> = {
  create?: Method<TCreateInput>;
} & { [methodName: string]: Method };

export type Transform<T, C = MethodContext> = (
  t: T,
  context: C
) => { [k in keyof T]: any };

export function method<T extends z.ZodObject<z.ZodRawShape>>({
  inputShape,
  inputTransform,
  ...rest
}: {
  inputShape?: T;
  inputTransform?: Transform<z.infer<T>>;
  requires?: string[];
  implies?: string[];
} & Pick<Method<z.infer<T>>, "body">): Method<z.infer<T>> {
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

export type ResourceDefinition<TCreateInput = any> = {
  type: string;
  description?: string;
  methods?: Methods<TCreateInput>;
};
