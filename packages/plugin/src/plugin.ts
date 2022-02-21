import path from "path";
import { z } from "zod";
import { inquire, QuestionGenerator } from "@fx/zod-inquirer";
import { MaybePromise } from "./promise";
import { JSONFile } from "@nice/file";
import { ResourceInstance } from "./resource";
import { getPatternLocations, Location } from "./locations";

export const FRAMEWORK_FOLDER = `.fx`;
export const PROJECT_FILE_NAME = "project.json";

export type Plugin = {
  readonly name: string;
  resourceDefinitions(): MaybePromise<ResourceDefinition[]>;
};

export type Config = {
  resourceDefinitions?: ResourceDefinition[];
  plugins?: Plugin[];
};

export type Project = {
  resources: ResourceInstance[];
};

export type ResourceDefinition<TCreateInput = any> = {
  type: string;
  description?: string;
  methods?: Methods<TCreateInput>;
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

export type LoadedConfiguration = {
  config: Config;
  configFilePath: string;
  projectFile: ProjectFile;
  project: Project;
  getResourceDefinitions(): ResourceDefinition[];
  getResourceDefinition<TInput = any>(
    type: string
  ): ResourceDefinition<TInput> | undefined;
  getResources(): LoadedResource[];
  getResource<TInput = any>(
    refOrId: string | ResourceReference
  ): LoadedResource<TInput> | undefined;
  setResource(instance: ResourceInstance): ResourceInstance;
  setMethodResult(
    resoureId: string,
    method: string,
    path: (string | number)[],
    result: any
  ): ResourceInstance | undefined;
  clone(): LoadedConfiguration;
};

export type Typed = { type: string };

export type ResourceReference = {
  $resource: string;
  before?: boolean;
};

export function resourceId(instance: ResourceInstance) {
  if (!instance) return `[null]`;
  const { id, type } = instance;
  return `${type}:${id}`;
}

export function isResourceReference(o: any): o is ResourceReference {
  return !!o && typeof o == "object" && "$resource" in o;
}

export type ResourceReferenceLocation = {
  reference: ResourceReference;
  path: (string | number)[];
};

export function getResourceReferences(object: any) {
  return Object.values(object)?.filter(isResourceReference);
}

export function getResourceReferenceLocations(o: any) {
  return getPatternLocations(o, isResourceReference);
}

export function isResourceReferencePending(ref: ResourceReference): boolean {
  return !/:/.test(ref.$resource);
}

export function getPendingResourceReferences(
  object: any
): Location<ResourceReference>[] {
  return getPatternLocations(
    object,
    (o) => isResourceReference(o) && isResourceReferencePending(o)
  );
}

export function getResourceDependencies(
  resource: LoadedResource,
  ...methodNames: string[]
): { dependencies: ResourceReference[]; errors: string[] } {
  const { instance, definition } = resource;
  const result = [];
  const errors = [];
  const targetMethodNames =
    methodNames ?? Object.keys(definition?.methods ?? {});
  for (let methodName of targetMethodNames) {
    const methodResult = instance.inputs?.[methodName];
    if (methodName in (definition?.methods ?? {}) && !methodResult) {
      errors.push(
        `method ${methodName} of ${resourceId(instance)} has not run yet`
      );
    }
    if (methodResult) result.push(...getResourceReferences(methodResult));
  }
  return { dependencies: result, errors };
}

export type MethodResult = void | object;

export type Method<TInput = any, TCreateInput = TInput> = {
  inputs?(context: {
    defaults?: Partial<TInput>;
    resource: LoadedResource<TCreateInput>;
    config: LoadedConfiguration;
    questionGenerator?: QuestionGenerator;
  }): MaybePromise<TInput>;
  body?(context: {
    input: TInput;
    resource: LoadedResource<TCreateInput>;
    config: LoadedConfiguration;
  }): MaybePromise<MethodResult>;
  requires?: string[];
  implies?: string[];
};

export type Methods<TCreateInput = any> = {
  create?: Method<TCreateInput, TCreateInput>;
} & { [methodName: string]: Method<any, TCreateInput> };

export type Transform<T, C = any> = (
  t: T,
  context: C
) => { [k in keyof T]: any };

export function method<
  T extends z.ZodObject<z.ZodRawShape>,
  TCreateInput = any
>({
  inputShape,
  inputTransform,
  ...rest
}: {
  inputShape?: T;
  inputTransform?: Transform<z.infer<T>>;
  requires?: string[];
  implies?: string[];
  body?: Method<z.infer<T>, TCreateInput>["body"];
}): Method<z.infer<T>, TCreateInput> {
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
