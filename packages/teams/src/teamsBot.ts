import { z } from "zod";
import { ResourceDefinition, method } from "@fx/plugin";

export function teamsBot(): ResourceDefinition {
  return {
    type: "teams-bot",
    description: "An Azure Bot Service powered bot connected to Teams",
    methods: {
      create: method({
        inputShape: z.object({
          name: z.string().describe("the name of the teams bot app"),
          manifest: z.literal("manifest").describe("a Teams manifest file"),
          botService: z
            .literal("azure-bot-service")
            .describe("an Azure Bot Service"),
        })
      }),
    },
  };
}
