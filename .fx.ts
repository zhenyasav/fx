import path from "path";
import { Config, removeScope } from "@fx/core";
import { template } from "@fx/templates";
import { teams } from "@fx/teams";
import { z } from "zod";

const config: Config = {
  plugins: [
    teams(),
    {
      name: "templates",
      resources() {
        return [
          template({
            name: "package",
            description: "creates a new typescript package in ./packages/",
            input: z.object({
              name: z.string().describe("name the package"),
              flattenScope: z
                .boolean()
                .describe("flatten scopes")
                .default(true),
            }),
            templateDir: path.resolve(__dirname, "templates/package"),
            outputDir: (input) =>
              path.resolve(
                __dirname,
                "packages",
                input.flattenScope ? removeScope(input.name) : input.name
              ),
          }),
        ];
      },
    },
  ],
};

export default config;
