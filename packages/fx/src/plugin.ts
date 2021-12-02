export type Events = "create";
import { Effect } from "./effects.js"

export type CreateContext<T> = {
  input: T
}

export type ResourceDefinition<I = {}> = {
  type: string;
  description?: string;
  // input?: I;
  create(context: CreateContext<I>): Promise<Effect[]>;
};

export abstract class Plugin {
  abstract resourceDefinitions(): Promise<ResourceDefinition[]>;
}