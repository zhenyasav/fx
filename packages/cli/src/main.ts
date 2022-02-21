#!/usr/bin/env node
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
  try {
    info();
    info(await fx.printPlan(plan));
    info();

    if (!dry) {
      const { confirmed } = await inquirer.prompt([
        {
          type: "confirm",
          default: true,
          message: `continue?`,
          name: "confirmed",
        },
      ]);
      if (confirmed) {
        info(`\nexecuting ${plan?.description ?? ""}...`);
        console.group();
        const { created } = await fx.executePlan(plan);
        console.groupEnd();
        info(
          green(`\n${plan?.description ? plan.description + " " : ""}done.\n`)
        );
        if (created.length) {
          info("new resources:");
          const config = await fx.requireConfig();
          const newResources = created.map(
            (c) =>
              config.getResource(resourceId(c.effect.instance))
                ?.definition!
          );
          console.group();
          printResources(newResources, { methods: true });
          console.groupEnd();
          info("");
        }
      } else {
        info(`aborted ${plan.description}`);
      }
    } else {
      info("dry run, no changes made.");
    }
  } catch (err: any) {
    error(red("problem while executing plan"));
    error(err);
    process.exit(1);
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
        if (plan) await executePlan(dry, plan);
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
        console.log(yellow(`create ${type}:`));
        const plan = await withLoader("planning", () =>
          fx.planCreateResource(type, { input: { ...rest, name } })
        );
        if (!plan) return;
        await executePlan(dry, plan);
      } catch (err: any) {
        console.error(red("problem while executing plan:"));
        console.error(err);
        process.exit(1);
      }
    }
  )
  .command(
    ["remove <resourceId>", "rm"],
    "remove a resource",
    (yargs) =>
      yargs.positional("resourceId", {
        type: "string",
        describe: "the resource id to delete",
      }),
    async (argv) => {
      const { resourceId, dry } = argv;
      try {
        const plan = await fx.planRemoveResource(resourceId!);
        if (plan) await executePlan(dry, plan);
      } catch (err: any) {
        error("problem while trying to remove resource");
        error(err);
        process.exit(1);
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
          info("");
        }
        process.exit(1);
      }
      const plan = await fx.planMethod(methodName);
      info(`invoking ${yellow(`[${methodName}]`)}:`);
      info("");
      if (plan) await executePlan(dry, plan);
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
