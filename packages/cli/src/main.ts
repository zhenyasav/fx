#!/usr/bin/env node
import os from "os";
import yargs from "yargs";
import { Fx, resourceId } from "@fx/core";
import {
  printLogo,
  printResourceInstance,
  printResources,
  info,
  error,
} from "./prettyPrint";
import { Plan } from "@fx/core";
import { gray, green, red, yellow } from "chalk";
import inquirer from "inquirer";

const fx = new Fx();

async function executePlan(dry: boolean, plan: Plan) {
  console.log(`plan with ${plan?.length} tasks:`);
  console.group();
  console.log((await fx.printPlan(plan)).join(os.EOL));
  console.groupEnd();
  console.log("");

  if (!dry) {
    const { confirmed } = await inquirer.prompt([
      {
        type: "confirm",
        default: true,
        message: `execute ${plan.length} tasks?`,
        name: "confirmed",
      },
    ]);
    if (confirmed) {
      console.log(`\nexecuting ${plan.length} tasks ...`);
      console.group();
      const { created } = await fx.executePlan(plan);
      console.groupEnd();
      console.log(green(`\n${plan.length} tasks done.\n`));
      if (created.length) {
        console.log("new resources:");
        const config = await fx.requireConfig();
        const newResources = created.map(
          (c) =>
            config.getResource({ $resource: resourceId(c.effect.instance) })
              ?.definition!
        );
        console.group();
        printResources(newResources, { methods: true });
        console.groupEnd();
        console.log("");
      }
    }
  } else {
    console.log("dry run, no changes made.");
  }
}

// TODO: implement loader
async function withLoader<T = any>(
  loading: string,
  work: () => Promise<T>,
  done: string = loading + " done"
): Promise<T | undefined> {
  return work();
}

const parser = yargs(process.argv.slice(2))
  .scriptName("fx")
  .usage("$0 [-d] <cmd> [args]")
  .option("dry", {
    alias: "d",
    type: "boolean",
    default: false,
    description: "do not touch anything, just show the plan",
  })
  .version(false)
  .command(
    "init",
    "initialize a project or resource",
    (yargs) => yargs,
    async ({ dry }) => {
      try {
        const plan = await fx.planInit();
        await executePlan(dry, plan);
      } catch (err) {
        error(err);
        process.exit(1);
      }
    }
  )
  .command(
    ["search", "se"],
    "search resources",
    (yargs) => yargs,
    async () => {
      const resources = await withLoader("loading resources", async () => {
        try {
          return (await fx.config())?.getResourceDefinitions();
        } catch (err) {
          error(err);
          process.exit(1);
        }
      });
      if (resources && resources.length) {
        info(`${resources.length} resource types available:`);
        printResources(resources, { methods: true });
      } else {
        info("there are no resource definitions installed in this project");
      }
      info("");
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

        console.log("");
        console.log(yellow(`Creating '${type}':`));
        const plan = await withLoader("planning", () =>
          fx.planCreateResource(type, { input: { ...rest, name } })
        );
        if (!plan) return;
        console.log("");
        await executePlan(dry, plan);
      } catch (err: any) {
        console.error(red("problem while executing plan:"));
        console.error(err.message);
      }
    }
  )
  .command(
    ["list [type]", "ls"],
    "show resources configured in the current project",
    (yargs) => {
      return yargs.positional("type", {
        type: "string",
        describe: "the type of resource to filter by",
      });
    },
    async (argv) => {
      const { type } = argv;
      const config = await fx.requireConfig();
      if (!config.project) {
        info(`project is empty`);
        return;
      }
      const resources = type
        ? config.project.resources?.filter((res) => res.type == type)
        : config.project.resources;
      info(`${resources ? resources.length : 0} resources in project:`);
      resources?.forEach((r) =>
        printResourceInstance(r, config.getResourceDefinition(r.type)!)
      );
    }
  )
  .command(
    "$0",
    false,
    () => {},
    async (argv) => {
      const [method] = argv._;
      const { dry } = argv;
      if (!method) {
        info(await parser.getHelp());
        error("error: at least one argument is required");
        process.exit(1);
      }
      const methodName = method.toString();
      const resources = await fx.getResourcesWithMethod(methodName);
      if (!resources.length) {
        error(
          "there are no configured resources in the project supporting this method"
        );
        const config = await fx.requireConfig();
        const defs = config.getResourceDefinitions().filter((res) => {
          return res.methods && methodName in res.methods;
        });
        if (defs?.length) {
          info(
            `\nThese (${defs.length}) known resource types support ${yellow(
              `[${methodName}]`
            )} and can be created with 'fx add <resource-type>':`
          );
          printResources(defs, { methods: true });
          info('');
        }
        process.exit(1);
      }
      const plan = await fx.planMethod(methodName);
      info(`invoking ${yellow(`[${methodName}]`)}:`);
      info("");
      await executePlan(dry, plan);
    }
  )
  .showHelpOnFail(false);

async function main() {
  try {
    printLogo();
    await parser.parse();
  } catch (err: any) {
    error(`${err?.message}\n`);
    info(await parser.getHelp());
  }
}

main();
