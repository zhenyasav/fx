import { TemplateContext } from "@fx/templates";

export type Input = {
  name: string;
};

export default ({ input }: TemplateContext<Input>) => /*javascript*/ `
{
  "name": "${input?.name}",
  "version": "0.0.1",
  "main": "src/index.ts",
  "typings": "build/index.d.ts",
  "types": "build/index.d.ts",
  "publishConfig": {
    "main": "build/index.js",
  },
  "scripts": {
    "clean": "rm -rf build && tsc --build --clean"
    "build": "tsc",
  }
}
`;
