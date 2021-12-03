import { TemplateContext } from "@nice/fx";

export type Input = {
  name: string;
};

export default ({ input }: TemplateContext<Input>) => /*javascript*/ `
{
  "name": "${input?.name}",
  "version": "1.0.0",
  "type": "module",
  "private": true,
  "main": "src/index.ts",
  "publishConfig": {
    "main": "build/index.ts",
    "typings": "build/index.d.ts"
  },
  "scripts": {
    "build:es": "node scripts/build.js && tsc --emitDeclarationOnly",
    "build:dts": "tsc --emitDeclarationOnly",
    "build": "tsc --build",
    "clean": "rm -rf build"
  },
  "devDependencies": {
    "esbuild": "^0.14.0",
    "glob": "^7.2.0"
  }
}
`;
