export type Events = "create";
import { Effect } from "./effects.js"

export type CreateContext<T> = {
  inputs: T
}

export type ResourceDefinition<I = {}> = {
  type: string;
  description?: string;
  input?: any;
  create(context: CreateContext<I>): Promise<Effect[]>;
};

export abstract class Plugin {
  abstract resourceDefinitions(): Promise<ResourceDefinition[]>;
}