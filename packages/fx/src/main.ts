#!/usr/bin/env node
import yargs from "yargs";
import { Fx } from "./fx.js";
import chalk from "chalk";

const logo = `
  _______  __
 |  ___\\ \\/ /
 | |_   \\  / 
 |  _|  /  \\ 
 |_|   /_/\\_\\
 
`;

console.info(chalk.cyan(logo));

const fx = new Fx();

yargs(process.argv.slice(2))
  .scriptName("fx")
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
    "new <type> <name>",
    "create something",
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
      const { type, name } = argv;
      if (!type) throw new Error("type is required");
      if (!name) throw new Error("a resource name is required");
      await fx.createResource(type, name);
    }
  )
  .option("dry", {
    alias: "d",
    type: "boolean",
    description: "do not touch anything, just show the plan",
  })
  .option("verbose", {
    alias: "v",
    type: "boolean",
    description: "print more stuff",
  })
  .showHelpOnFail(false)
  .demandCommand()
  .parse();
