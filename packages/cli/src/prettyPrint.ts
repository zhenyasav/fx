import { ResourceDefinition, ResourceInstance } from "@fx/core";
import chalk from "chalk";
import Table from "cli-table";
import prettyjson from "prettyjson";
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

export function printResources(
  resources: ResourceDefinition[],
  options?: { methods?: boolean }
) {
  const { methods } = { methods: false, ...options };
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
  table.push(
    [gray("type"), gray("description"), ...(methods ? [gray("methods")] : [])],
    ...resources?.map((r) => {
      const methodKeys = (methods && r?.methods ? Object.keys(r.methods) : [])
        .filter((m) => m != "create")
        .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
      const formattedMethods = methods
        ? methodKeys.map((m) => yellow(`[${m}]`)).join(" ")
        : "";
      return [
        cyan(r.type),
        r.description,
        ...(methods ? [formattedMethods] : []),
      ];
    })
  );
  console.log(table.toString());
}

export function printResourceDefinition(resource: ResourceDefinition) {
  console.log(`${cyan(resource.type)} ${gray("-")} ${resource.description}`);
}

export function printResourceInstance(resource: ResourceInstance) {
  console.log(`${white(resource.type)} ${gray(resource.id)}`);
  if (resource?.inputs)
    console.log(gray(prettyjson.render(resource.inputs, {}, 2)));
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
