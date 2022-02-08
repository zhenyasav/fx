import { z } from "zod";
import { Plugin, ResourceDefinition, method } from "@fx/plugin";

export function botService(): ResourceDefinition {
  return {
    type: "azure-bot-service",
    description: "Azure Bot Service bot registration",
    methods: {
      create: method({
        inputShape: z.object({
          messagingEndpoint: z.union([
            z.string().describe("Bot messaging endpoint"),
            z
              .literal("tunnel")
              .describe("Tunneling resource"),
          ]),
        }),
      }),
    },
  };
}

export function bots(): Plugin {
  return {
    name: "Azure Bot Service bots",
    resources() {
      return [botService()];
    },
  };
}
