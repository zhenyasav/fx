import path from "path";
import { z } from "zod";
import { template } from "@fx/templates";

export const packageInput = z.object({
  name: z.string().describe("name the package"),
  flattenScope: z.boolean().describe("flatten scopes").default(true),
});

export type PackageInput = z.infer<typeof packageInput>;

export function removeScope(s: string) {
  const split = s.split("/");
  return split.length > 1 ? split.slice(1).join("/") : split[0];
}

export function packageTemplate() {
  return template({
    name: "package",
    description: "a typescript package template",
    input: packageInput,
    templateDirectory: __dirname,
    outputDirectory: (input) =>
      path.resolve(
        __dirname,
        "../../packages",
        input.flattenScope ? removeScope(input.name) : input.name
      ),
  });
}