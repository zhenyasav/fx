import { z } from "zod";
import { method, ResourceDefinition } from "@fx/plugin";

export function tab(): ResourceDefinition {
  return {
    type: "teams-tab",
    description: "A Teams Tab",
    methods: {
      create: method({
        inputShape: z.object({
          name: z.string().describe("enter the tab name"),
          manifest: z
            .literal("teams-manifest")
            .describe("specify teams manifest"),
          url: z
            .union([
              z
                .string()
                .describe("enter the https url of the tab")
                .default("https://localhost:3000"),
              z.literal("tunnel").describe("use a tunnel resource"),
            ])
            .describe("identify the tab URL"),
        }),
      }),
    },
  };
}
