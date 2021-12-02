export type Events = "create";
import { Effect } from "./effects.js";

export type CreateContext<T> = {
  input: T;
};

export type CreateResourceResult<I = {}> = {
  description?: string;
  input: I;
  effects: Effect[];
};

export type ResourceDefinition<I = {}> = {
  type: string;
  description?: string;
  create(context: CreateContext<I>): Promise<CreateResourceResult<I>>;
};

export abstract class Plugin {
  abstract resourceDefinitions(): Promise<ResourceDefinition[]>;
}
