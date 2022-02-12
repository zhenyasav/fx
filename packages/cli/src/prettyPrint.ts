import { ResourceDefinition, ResourceInstance } from "@fx/core";
import chalk from "chalk";
import Table from "cli-table";
const { cyan, gray, white, yellow, red } = chalk;

export const logo = ` _______  __
|  ___\\ \\/ /
| |_   \\  / 
|  _|  /  \\ 
|_|   /_/\\_\\
`;
export function printLogo() {
  console.log(cyan(logo));
}

export function printResources(resources: ResourceDefinition[]) {
  const table = new Table({
    chars: {
      top: "",
      "top-mid": "",
      "top-left": "",
      "top-right": "",
      bottom: "",
      "bottom-mid": "",
      "bottom-left": "",
      "bottom-right": "",
      left: "",
      "left-mid": "",
      mid: "",
      "mid-mid": "",
      right: "",
      "right-mid": "",
      middle: "",
    },
  });
  table.push(...resources?.map((r) => [cyan(r.type), r.description]));
  console.log(table.toString());
}

export function printResourceDefinition(resource: ResourceDefinition) {
  console.log(`${cyan(resource.type)} ${gray("-")} ${resource.description}`);
}

export function printResourceInstance(resource: ResourceInstance) {
  console.log(`${white(resource.type)} ${gray(resource.id)}`);
  if (resource?.inputs)
    console.log(gray(JSON.stringify(resource.inputs, null, 2)));
}

export function warn(...args: any[]) {
  console.warn(...args.map((c) => yellow(c)));
}

export function error(...args: any[]) {
  console.error(...args.map((c) => red(c)));
}

export function info(...args: any[]) {
  console.info(...args.map((c) => gray(c)));
}
