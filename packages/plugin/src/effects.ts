import { File } from "@nice/file";

export namespace Effects {
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
  };

  export type Effect =
    | WriteFile
    | Shell
    | PackageScript;

  export type Handler<T extends { type: string } = Effects.Effect> = {
    describe(e: T): string;
    apply(e: T): Promise<any>;
  };

  export type Handlers<TEffect extends { type: string } = Effect> = {
    [T in TEffect["type"]]: Handler<Extract<TEffect, { type: T }>>;
  };
}
