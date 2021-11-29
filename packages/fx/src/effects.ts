import { File } from "@nice/ts-template";

export type CreateFileEffect = {
  type: "create-file";
  file: File;
};

export type CopyFileEffect = {
  type: "copy-file";
  source: string;
  dest: string;
}

export type RunPackageScriptEffect = {
  type: "package-script";
};

export type Effect = CreateFileEffect | RunPackageScriptEffect;
