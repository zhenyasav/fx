#!/usr/bin/env node
import yargs from "yargs";
import { Fx } from "@fx/core";
import {
  printLogo,
  printResourceInstance,
  printResourceDefinition,
  info,
  error,
} from "./prettyPrint";
import config from "./config";
import { gray } from "chalk";

const fx = new Fx({
  aadAppId: config.teamsfxcliAadAppId,
});

const parser = yargs(process.argv.slice(2))
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
  .demandCommand(1, "at least one command is required")
  .command(
    "se",
    "search resources",
    (yargs) => yargs,
    async (args) => {
      const resources = (await fx.config())?.getResourceDefinitions();
      if (!resources.length) {
        info("there are no resource definitions installed in this project");
      } else {
        console.log(`${resources.length} resource types available:`);
        resources.forEach(printResourceDefinition);
      }
      console.log("");
    }
  )
  .command(
    "add <type> [name]",
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
      const { type, name, dry, d, v, verbose, $0, _, ...rest } = argv;
      if (!type) throw new Error("type is required");
      try {
        console.log(gray("cwd: " + process.cwd()));
        const instance = await fx.createResource(
          type,
          { ...rest, name },
          !!dry
        );
        console.log("added resource:", JSON.stringify(instance, null, 2));
      } catch (err: any) {
        console.error(err.message);
      }
    }
  )
  .command(
    "ls [type]",
    "show resources configured in the current project",
    (yargs) => {
      return yargs.positional("type", {
        type: "string",
        describe: "the type of resource to filter by",
      });
    },
    async (argv) => {
      const { type } = argv;
      const config = await fx.config();
      if (!config.project) {
        console.log(`project is empty`);
        return;
      }
      const resources = type
        ? config.project.resources?.filter((res) => res.type == type)
        : config.project.resources;
      console.log(`${resources ? resources.length : 0} resources in project:`);
      resources?.forEach(printResourceInstance);
    }
  )
  .command(
    "$0",
    false,
    () => {},
    async (argv) => {
      const [arg] = argv._;
      if (!arg) {
        console.error("at least one command is required");
        return;
      }
      const methodName = arg.toString();
      const resources = await fx.getResourcesWithMethod(methodName);
      if (!resources.length) {
        error(
          "there are no configured resources in the project supporting this method"
        );
        const config = await fx.config();
        const defs = config.getResourceDefinitions().filter((res) => {
          return res.methods && methodName in res.methods;
        });
        if (defs?.length) {
          info(
            `\nThese (${defs.length}) known resource types support '${methodName}' and can be created with 'fx add <resource-type>':`
          );
          defs.forEach(printResourceDefinition);
        }
        process.exit(1);
      }
      await fx.invokeMethodOnAllResources(methodName);
    }
  )
  .showHelpOnFail(false);

async function main() {
  try {
    printLogo();
    await parser.parse();
  } catch (err: any) {
    error(`${err?.message}\n`);
    console.info(await parser.getHelp());
  }
}

main();
