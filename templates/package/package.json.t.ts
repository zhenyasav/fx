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
  "scripts": {
    "build": "node scripts/build.js",
    "build:tsc": "tsc",
    "clean": "rm -rf build"
  },
  "devDependencies": {
    "esbuild": "^0.14.0",
    "glob": "^7.2.0"
  }
}
`;
