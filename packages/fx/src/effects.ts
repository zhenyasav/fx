import { File } from "@nice/ts-template";

export type WriteFileEffect = {
  type: "write-file";
  file: File;
};

export type StartShellEffect = {
  type: "shell";
  command: string;
}

export type RunPackageScriptEffect = {
  type: "package-script";
  name: string;
};

export type Effect = WriteFileEffect | RunPackageScriptEffect;

export type EffectHandler<T extends Effect> = {
  describe(e: T): string;
  apply(e: T): Promise<any>;
};

export const WriteFileHandler: EffectHandler<WriteFileEffect> = {
  describe(e) {
    return `create file: ${e.file.shortDescription()}`;
  },
  async apply(e) {
    const { file } = e;
    await file.save();
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
  "write-file": WriteFileHandler,
  "package-script": PackageScriptHandler,
};

export function handler<T extends Effect = Effect>(e: T): EffectHandler<T> {
  return Effects[e.type] as EffectHandler<T>;
}
