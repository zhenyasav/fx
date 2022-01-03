import { File } from "@nice/file";

export namespace Effect {
  export type WriteFile = {
    type: "write-file";
    file: File;
  };

  export type Shell = {
    type: "shell";
    command: string;
    cwd?: string;
  };

  export type PackageScript = {
    type: "package-script";
    name: string;
    args?: string[];
  };

  export type Any = WriteFile | Shell | PackageScript;
}

export type Effector<T extends { type: string } = Effect.Any> = {
  describe(e: T): string;
  apply(e: T): Promise<any>;
};

export type EffectorSet<TEffect extends { type: string } = Effect.Any> = {
  [T in TEffect["type"]]: Effector<Extract<TEffect, { type: T }>>;
};
