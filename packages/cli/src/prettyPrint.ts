import {
  ResourceDefinition,
  LoadedResource,
  ResourceInstance,
  resourceId,
} from "@fx/core";
import chalk from "chalk";
import Table from "cli-table";
import { compact } from "lodash";
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
  resources: Partial<LoadedResource>[],
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
    [
      gray("type[:id]"),
      gray("description"),
      ...(methods ? [gray("methods")] : []),
    ],
    ...resources?.map((resource) => {
      const formattedMethods = resource?.definition
        ? printMethods(resource.definition)
        : "";
      const identifier = resource?.instance
        ? resourceId(resource.instance)
        : resource?.definition
        ? resource?.definition.type
        : "";
      const description = resource?.definition?.description;
      return compact([
        identifier ? cyan(identifier) : "",
        description,
        formattedMethods,
      ]);
    })
  );
  console.log(table.toString());
}

export function printMethods(def: ResourceDefinition) {
  const methodKeys = (def?.methods ? Object.keys(def.methods) : [])
    .filter((m) => m != "create")
    .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
  const formattedMethods = methodKeys?.length
    ? methodKeys.map((m) => yellow(`[${m}]`)).join(" ")
    : "";
  return formattedMethods;
}

export function printResourceDefinition(resource: ResourceDefinition) {
  console.log(`${cyan(resource.type)} ${gray("-")} ${resource.description}`);
}

export function printResourceInstance(
  resource: ResourceInstance,
  def: ResourceDefinition
) {
  const methodFmt = printMethods(def);
  console.log(
    `${white(resource.type)} ${gray(resource.id)}${
      methodFmt ? gray(" methods: ") + methodFmt : ""
    }`
  );
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
  console.info(...args);
}
