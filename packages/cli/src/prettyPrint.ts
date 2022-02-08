import { ResourceDefinition, ResourceInstance } from "@fx/core";
import chalk from "chalk";
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
