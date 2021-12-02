import * as path from "path";
import { DirectoryTemplate } from "@nice/ts-template";
import { Plugin, ResourceDefinition } from "./plugin.js";
import { Effect } from "./effects.js";
import { fulfillMissingInputs, InputSpec } from "./inputs.js";

export type Options = {
  name: string;
  templateDir: string;
  description?: string;
  outputDir?: string;
  flattenScopes?: boolean;
};

export type DefaultInput = { name: string };

export function removeScope(s: string) {
  const split = s.split("/");
  return split.length > 1 ? split.slice(1).join("/") : split[0];
}

export function templateResource<TInput = {}>(options: Options): Plugin {
  const { name, templateDir, description, flattenScopes } = {
    flattenScopes: true,
    ...options,
  };
  if (!name) throw new Error("a name for the resource is required");
  if (!templateDir)
    throw new Error(
      "a template resource must have a path to the root folder of the template"
    );
  return new (class extends Plugin {
    async resourceDefinitions(): Promise<
      [ResourceDefinition<{ name: string }>]
    > {
      return [
        {
          type: name,
          description,
          async create({ inputs: { name } }): Promise<Effect[]> {
            const template = new DirectoryTemplate<{ name: string }>({
              path: templateDir,
            });
            const spec: InputSpec<{ outputDir: string }> = {
              questions: [
                {
                  type: "input",
                  name: "outputDir",
                  message: "Specify destination folder:",
                  default: "./"
                },
              ],
              defaults: {
                outputDir: options.outputDir,
              },
            };
            const { outputDir } = await fulfillMissingInputs(spec);
            const files = await template.generate({
              input: { name },
              outputDirectory: path.resolve(
                outputDir,
                flattenScopes ? removeScope(name) : name
              ),
            });
            return files?.map((file) => ({
              type: "write-file",
              file,
            }));
          },
        },
      ];
    }
  })();
}
