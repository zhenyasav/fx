import { z } from "zod";
import { Plugin, ResourceDefinition, method } from "@fx/plugin";

export function aadAppRegistration(): ResourceDefinition {
  return {
    type: "aad-app",
    description: "AAD App Registration",
    methods: {
      dev: method({
        inputShape: z.object({
          appUri: z.string().describe('app URI for the application'),
        }),
        body() {
          return {
            effects: [
              {
                type: "function",
                description: "ensure AAD registration",
                async body() {},
              },
            ],
          };
        },
      }),
    },
  };
}

export function aad(): Plugin {
  return {
    name: "Azure Active Directory",
    async resourceDefinitions() {
      return [aadAppRegistration()];
    },
  };
}
