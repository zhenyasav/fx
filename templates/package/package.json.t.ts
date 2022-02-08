import { TemplateContext, TemplateFunction } from "@fx/templates";

export type Input = {
  name: string;
};

const template: TemplateFunction<Input> = ({ input }: TemplateContext<Input>) => /*javascript*/ `
{
  "name": "${input?.name}",
  "version": "0.0.1",
  "main": "build/index.js",
  "typings": "build/index.d.ts",
  "types": "build/index.d.ts",
  "scripts": {
    "clean": "rm -rf build && tsc --build --clean",
    "build": "tsc",
    "check": "tsc --noEmit"
    "test": "jest"
  },
  "devDependencies": {
    "@swc/core": "^1.2.137",
    "@swc/jest": "^0.2.17",
    "@types/jest": "^27.4.0",
    "@types/node": "^16.11.11",
    "jest": "^27.4.5",
    "typescript": "^4.5.5",
    "chai": "^4.3.4"
  }
}
`;

export default template;
