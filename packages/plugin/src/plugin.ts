import { Effects } from "./effects.js";

export type CreateContext<T> = {
  input: T;
};

export type CreateResourceResult<TInput = {}> = {
  description?: string;
  input: TInput;
  effects: Effects.Effect[];
};

export type ResourceDefinition<TInput = {}> = {
  type: string;
  description?: string;
  create(context: CreateContext<TInput>): Promise<CreateResourceResult<TInput>>;
};

export abstract class Plugin {
  abstract resourceDefinitions(): Promise<ResourceDefinition[]>;
}
