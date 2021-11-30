#!/usr/bin/env node
import yargs from "yargs";
import { Fx } from "./fx.js";
import chalk from "chalk";

const logo = 
` _______  __
|  ___\\ \\/ /
| |_   \\  / 
|  _|  /  \\ 
|_|   /_/\\_\\
`;

console.info(chalk.cyan(logo));

const fx = new Fx();

yargs(process.argv.slice(2))
  .scriptName("fx")
  .usage("$0 [-d] <cmd> [args]")
  .option("dry", {
    alias: "d",
    type: "boolean",
    default: false,
    description: "do not touch anything, just show the plan",
  })
  .option("verbose", {
    alias: "v",
    type: "boolean",
    default: false,
    description: "print more stuff",
  })
  .command(
    "ls",
    "list resources",
    (yargs) => yargs,
    async () => {
      const resources = await fx.getAllResources();
      if (!resources.size) {
        console.info(
          chalk.gray(
            "there are no resource definitions installed in this project"
          )
        );
      } else {
        console.log(`${resources.size} resource types available:`);
        resources.forEach(({ resource }) => {
          const { cyan, gray } = chalk;
          console.log(
            `${cyan(resource.type)} ${gray("-")} ${resource.description}`
          );
        });
      }
    }
  )
  .command(
    "add <type> <name>",
    "create a new resource",
    (yargs) => {
      return yargs
        .positional("type", {
          type: "string",
          describe: "the type of thing to create",
        })
        .positional("name", {
          type: "string",
          describe: "how to name the new thing",
        });
    },
    async (argv) => {
      const { type, name, dry } = argv;
      if (!type) throw new Error("type is required");
      if (!name) throw new Error("a resource name is required");
      await fx.createResource(type, name, !!dry);
    }
  )
  .showHelpOnFail(false)
  .demandCommand(1, 'need to specify a command')
  .parse();
