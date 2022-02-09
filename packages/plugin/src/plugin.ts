import path from "path";
import { z } from "zod";
import { inquire, QuestionGenerator } from "@fx/zod-inquirer";
import { Effect } from "./effects";
import { MaybePromise } from "./promise";
import { JSONFile } from "@nice/file";

export type Plugin = {
  readonly name: string;
  resources(): MaybePromise<ResourceDefinition[]>;
};

export type Config = {
  plugins?: Plugin[];
};

export type LoadedConfig = Config & {
  configFilePath: string;
  project: Project;
  projectFile: ProjectFile;
  getResourceDefinitions(): ResourceDefinition[];
  getResourceDefinition(type: string): ResourceDefinition | null;
  getResources(): LoadedResource[];
};

export const FRAMEWORK_FOLDER = `.fx`;
export const PROJECT_FILE_NAME = "project.json";

export type Project = {
  resources: ResourceInstance[];
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

export type MethodResult<
  TValue = any,
  TEffect extends Typed = Effect.Any
> = void | {
  description?: string;
  value?: TValue;
  effects?: TEffect[];
};

export type MethodContext = {
  config: LoadedConfig;
  resource: LoadedResource;
};

export type Method<
  TInput = any,
  TOutput = any,
  TEffect extends Typed = Effect.Any
> = {
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
  ): MaybePromise<MethodResult<TOutput, TEffect>>;
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

export function resourceId(instance: ResourceInstance) {
  if (!instance) return `[null]`;
  const { id, type } = instance;
  return `${type}:${id}`;
}

export type ResourceInstance<TCreateArgs = any> = {
  id: string;
  type: string;
  inputs?: { create?: TCreateArgs } & { [methodName: string]: any };
  outputs?: any;
};

export type LoadedResource<TCreateInput = any> = {
  instance: ResourceInstance<TCreateInput>;
  definition?: ResourceDefinition<TCreateInput>;
};
