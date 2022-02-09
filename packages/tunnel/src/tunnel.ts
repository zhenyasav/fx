import { z } from "zod";
import { method, Plugin, ResourceDefinition } from "@fx/plugin";
import ngrok from "ngrok";

export function tunnel(): ResourceDefinition {
  return {
    type: "tunnel",
    description: "create an ngrok tunnel",
    methods: {
      create: method({
        inputShape: z.object({
          port: z.number().describe("the local port the tunnel will reach")
        })
      }),
      dev: method({
        async body({ input }) {
          return {
            effects: [
              {
                type: "function",
                description: "start ngrok",
                async body() {
                  const url = await ngrok.connect(input.port ?? 3000);
                  console.log(
                    `started ngrok:`,
                    url,
                    `http://localhost:${input.port}`
                  );
                  return {
                    url,
                  };
                },
              },
            ],
          };
        },
      }),
    },
  };
}

export function tunnelPlugin(): Plugin {
  return {
    name: "tunneling",
    resources() {
      return [tunnel()];
    },
  };
}
