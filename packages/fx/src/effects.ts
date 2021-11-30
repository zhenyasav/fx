import { File } from "@nice/ts-template";
import { ellipsis } from "./ellipsis.js";
import * as path from "path";
import { promises as fs } from "fs";
import mkdirp from "mkdirp";

function relative(s: string) {
  return path.relative(process.cwd(), s);
}

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
    const { file } = e;
    await file.save();
  },
};

export const CopyFileHandler: EffectHandler<CopyFileEffect> = {
  describe(e) {
    return `copy file ${ellipsis(relative(e.source))} to ${ellipsis(
      relative(e.dest)
    )}`;
  },
  async apply(e) {
    const { dest, source } = e;
    await mkdirp(path.dirname(dest));
    await fs.copyFile(source, dest);
    console.info(`wrote ${ellipsis(relative(e.dest))}`);
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
