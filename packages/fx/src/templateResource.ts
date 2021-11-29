import * as path from "path";
import { DirectoryTemplate } from "@nice/ts-template";
import { Plugin, ResourceDefinition } from "./plugin.js";
import { Effect } from "./effects.js";

export type Options = {
  name: string;
  description?: string;
  templatePath: string;
  outputPath: string;
};

export function templateResource(options: Options): Plugin {
  const { name, templatePath, description, outputPath } = { ...options };
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
              outputPath: path.resolve(outputPath, name),
            });
            return files?.map((file) => ({ type: "create-file", file }));
          },
        },
      ];
    }
  })();
}
