import { File } from "@nice/ts-template";
import { ellipsis } from "./utils.js";

export type CreateFileEffect = {
  type: "create-file";
  file: File;
};

export type CopyFileEffect = {
  type: "copy-file";
  source: string;
  dest: string;
};

export type RunPackageScriptEffect = {
  type: "package-script";
  name: string;
};

export type Effect = CreateFileEffect | RunPackageScriptEffect | CopyFileEffect;

export type EffectHandler<T extends Effect> = {
  describe(e: T): string;
  apply(e: T): Promise<any>;
};

export const CreateFileHandler: EffectHandler<CreateFileEffect> = {
  describe(e) {
    return `create file: ${e.file.shortDescription()}`;
  },
  async apply(e) {
    throw new Error("not implemented");
  },
};

export const CopyFileHandler: EffectHandler<CopyFileEffect> = {
  describe(e) {
    return `copy file ${ellipsis(e.source)} to ${ellipsis(e.dest)}`;
  },
  async apply(e) {
    throw new Error("not implemented");
  },
};

export const PackageScriptHandler: EffectHandler<RunPackageScriptEffect> = {
  describe(e) {
    return `run package script ${e.name}`;
  },
  async apply(e) {
    throw new Error("not implemented");
  },
};

export type AllHandlers = {
  [T in Effect["type"]]: EffectHandler<Extract<Effect, { type: T }>>;
};

export const Effects: AllHandlers = {
  "copy-file": CopyFileHandler,
  "create-file": CreateFileHandler,
  "package-script": PackageScriptHandler,
};

export function handler<T extends Effect = Effect>(e: T): EffectHandler<T> {
  return Effects[e.type] as EffectHandler<T>;
}
