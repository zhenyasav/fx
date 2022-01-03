import { TemplateContext, TemplateFunction } from "@fx/templates";

export type Input = {
  name: string;
};

const template: TemplateFunction<Input> = ({ input }: TemplateContext<Input>) => /*javascript*/ `
{
  "name": "${input?.name}",
  "version": "0.0.1",
  "main": "build/index.ts",
  "typings": "build/index.d.ts",
  "types": "build/index.d.ts",
  "scripts": {
    "clean": "rm -rf build && tsc --build --clean",
    "build": "tsc"
  }
}
`;

export default template;
