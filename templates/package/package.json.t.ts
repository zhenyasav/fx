import * as fs from "fs";

console.log(fs.statSync(process.cwd()));

import { TemplateContext } from "@nice/fx";

export type Input = {
  name: string;
};

export default ({ input }: TemplateContext<Input>) =>
/*javascript*/`
{
  "name": "${input.name}",
  "version": "1.0.0",
  "type": "module",
  "private": true
}
`;
