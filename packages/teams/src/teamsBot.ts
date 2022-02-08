import { z } from "zod";
import { ResourceDefinition, method } from "@fx/plugin";

export function teamsBot(): ResourceDefinition {
  return {
    type: "teams-bot",
    description: "An Azure Bot Service powered bot connected to Teams",
    methods: {
      create: method({
        inputShape: z.object({
          name: z.string().describe('the name of the teams bot app'),
          bot: z.literal('bot').describe('an Azure Bot Service')
        }),
        body() {
          
        }
      })
    }
  }
}