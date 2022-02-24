import path from "path";
import { z } from "zod";
import { inquire, QuestionGenerator } from "@fx/zod-inquirer";
import { MaybePromise } from "./promise";
import { JSONFile, FileOptions } from "@nice/file";
import { ResourceInstance } from "./resource";
import { getPatternLocations, Location } from "./locations";
import { PropertyPath } from "./effects";

export const FRAMEWORK_FOLDER = `.fx`;
export const PROJECT_FILE_NAME = "project.json";

export type Plugin = {
  readonly name: string;
  resourceDefinitions(): MaybePromise<ResourceDefinition[]>;
};

export type Config = {
  resourceDefinitions?: ResourceDefinition[];
  resources?: ResourceInstance[];
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

export type ProjectLoadOptions = (
  | {
      projectFile: string;
    }
  | { projectFolder: string }
) &
  Partial<FileOptions<Project>>;

export class ProjectFile extends JSONFile<Project> {
  constructor(options: ProjectLoadOptions) {
    const {
      projectFile,
      projectFolder,
      path: p,
      ...rest
    } = {
      projectFolder: process.cwd(),
      projectFile: null,
      ...options,
    };
    const resolvedProjectFileName =
      projectFile ??
      path.resolve(projectFolder, FRAMEWORK_FOLDER, PROJECT_FILE_NAME);
    super({ path: p ?? resolvedProjectFileName, ...rest });
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
  getResources(selector?: string): LoadedResource[];
  getResource<TInput = any>(
    refOrId: string | ResourceReference
  ): LoadedResource<TInput> | undefined;
  setResource(instance: ResourceInstance): ResourceInstance;
  setMethodInput(
    resourceId: string,
    method: string,
    input: any
  ): ResourceInstance | undefined;
  setMethodResult(
    resourceId: string,
    method: string,
    path: PropertyPath,
    result: any
  ): ResourceInstance | undefined;
  removeResource(instanceId: string): boolean;
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

export function matchesSelector(
  instance: ResourceInstance,
  selector: string
): boolean {
  if (!instance) return false;
  if (!selector) return false;
  if (selector === "*") return true;
  const { id, type } = instance;
  const result =
    selector === type ||
    type.includes(selector) ||
    selector == id ||
    id.includes(selector) ||
    (type + id).includes(selector) ||
    resourceId(instance).includes(selector);
  // console.log("match", selector, resourceId(instance), result);
  return result;
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

export type MethodInputsContext<TInput, TCreateInput> = {
  methodName: string;
  defaults?: Partial<TInput>;
  resource: LoadedResource<TCreateInput>;
  config: LoadedConfiguration;
  questionGenerator?: QuestionGenerator;
};

export type Method<TInput = any, TCreateInput = TInput> = {
  inputs?(
    context: MethodInputsContext<TInput, TCreateInput>
  ): MaybePromise<TInput>;
  defaults?(
    context: MethodInputsContext<TInput, TCreateInput> & {
      answers: Partial<TInput>;
      methodName: string;
    }
  ): MaybePromise<Partial<TInput>>;
  body?(context: {
    methodName: string;
    input: TInput;
    resource: LoadedResource<TCreateInput>;
    config: LoadedConfiguration;
  }): MaybePromise<MethodResult>;
  requires?: string[];
  implies?: string[];
};

export type Methods<TCreateInput = any> = {
  create?: Method<TCreateInput, TCreateInput>;
  "*"?: Method<any, TCreateInput>;
} & { [methodName: string]: Method<any, TCreateInput> };

export type Transform<T, C = any> = (
  t: T,
  context: C
) => { [k in keyof T]: any };

export type TypeofFirstArg<T> = T extends (v: infer A) => any ? A : T;

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
} & Omit<Method<z.infer<T>, TCreateInput>, "inputs">): Method<
  z.infer<T>,
  TCreateInput
> {
  return inputShape
    ? {
        async inputs(context) {
          const { defaults, questionGenerator } = { ...context };
          const methodDefaultsFn = rest?.defaults;
          const answers = await inquire(inputShape, {
            defaults:
              typeof methodDefaultsFn == "function"
                ? (answers: Partial<z.infer<T>>) => {
                    return methodDefaultsFn({
                      answers: { ...defaults, ...answers },
                      ...context,
                    });
                  }
                : defaults,
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
