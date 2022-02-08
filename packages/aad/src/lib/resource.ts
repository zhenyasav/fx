import { method, ResourceDefinition } from "@fx/plugin";
import { z } from "zod";
// import { GraphClient } from "./graph";

export function aadAppRegistration(): ResourceDefinition {
  return {
    type: "aad-app",
    description: "Azure Active Directory app registration",
    methods: {
      create: method({
        inputShape: z.object({ name: z.string().describe("application name") }),
        body({ input }) {},
      }),
      provision: method({
        async body() {
          // const token = "";
          // const result = await GraphClient.createAADApp(token, {});
          console.log("woohoo");
        },
      }),
    },
  };
}
