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
        const { created, nextPlan } = await fx.executePlan(plan);
        console.groupEnd();
        if (nextPlan) {
          await executePlan(dry, nextPlan);
        }
        info(
          green(`\n${plan?.description ? plan.description + " " : ""}done.\n`)
        );
        if (created.length) {
          info("new resources:");
          const config = await fx.requireConfig();
          const newResources = created.map(
            (c) => config.getResource(resourceId(c.effect.instance))!
          );
          console.group();
          printResources(newResources, { methods: true });
          console.groupEnd();
          info("");
        }
      } else {
        info(`aborted ${plan.description ? plan.description : "plan"}`);
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
    "init [selector]",
    "initialize a project or resource",
    (yargs) =>
      yargs
        .positional("selector", {
          type: "string",
          describe: "a resource selector",
        })
        .option("recursive", {
          alias: "r",
          type: "boolean",
          default: false,
          description: "apply init to any dependent resources recursively",
        }),
    async ({ dry, selector, recursive }) => {
      try {
        const plan = await fx.planInit({ selector, recursive });
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
        printResources(
          resources?.map((definition) => ({
            definition,
          })),
          { methods: true }
        );
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
    "$0 [method] [selector]",
    "runs an arbitrary method on the resources of the project",
    (yargs) =>
      yargs
        .positional("method", {
          type: "string",
          describe: "the name of the method to run",
        })
        .positional("selector", {
          type: "string",
          descript: "a resource selector to limit the scope",
        }),
    async (argv) => {
      const { dry, selector, method } = argv;
      if (!method) {
        info(await parser.getHelp());
        error("error: at least one argument is required");
        process.exit(1);
      }
      const methodName = method.toString();
      const resources = await fx.getResourcesWithMethod(methodName);
      const config = await fx.requireConfig();
      if (!resources.length) {
        error(
          "there are no configured resources in the project supporting this method"
        );
        const defs = config.getResourceDefinitions().filter((res) => {
          return res.methods && methodName in res.methods;
        });
        if (defs?.length) {
          info(
            `\nThese (${defs.length}) known resource types support ${yellow(
              `[${methodName}]`
            )} and can be created with 'fx add <resource-type>':`
          );
          printResources(
            defs?.map((definition) => ({ definition })),
            { methods: true }
          );
          info("");
        }
        process.exit(1);
      }
      const selectedResources = selector ? config.getResources(selector) : null;
      if (selector)
        info(
          `${selectedResources?.length} resources match selector ${selector}`
        );
      const plan = await fx.planMethod(
        methodName,
        selectedResources ? { resources: selectedResources } : {}
      );
      info(`invoking ${yellow(`[${methodName}]`)}:`);
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
