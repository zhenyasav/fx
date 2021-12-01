import * as path from "path";
import { DirectoryTemplate } from "@nice/ts-template";
import { Plugin, ResourceDefinition } from "./plugin.js";
import { Effect } from "./effects.js";

export type Options = {
  name: string;
  description?: string;
  templatePath: string;
  outputPath: string;
  flattenScopes?: boolean;
};

export function removeScope(s: string) {
  const split = s.split("/");
  return split.length > 1 ? split.slice(1).join("/") : split[0];
}

export function templateResource(options: Options): Plugin {
  const { name, templatePath, description, outputPath, flattenScopes } = {
    flattenScopes: true,
    ...options,
  };
  if (!name) throw new Error("a name for the resource is required");
  if (!templatePath)
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
              path: templatePath,
            });
            const files = await template.generate({
              input: { name },
              outputDirectory: path.resolve(
                outputPath,
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
