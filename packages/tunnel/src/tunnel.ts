import {
  LoadedResource,
  method,
  effect,
  Plugin,
  ResourceInstance,
  ResourceDefinition,
  z,
} from "@fx/plugin";
import ngrok from "ngrok";

export const createTunnelInput = z.object({
  port: z
    .number()
    .describe("the local port the tunnel will reach")
    .default(3000),
});

export type CreateTunnelInput = z.infer<typeof createTunnelInput>;

export type TunnelResourceDefinition = ResourceDefinition<CreateTunnelInput>;

export type TunnelResourceInstance = ResourceInstance<CreateTunnelInput>;

export type TunnelResource = LoadedResource<CreateTunnelInput>;

export function tunnel(): TunnelResourceDefinition {
  return {
    type: "tunnel",
    description: "an ngrok tunnel",
    methods: {
      create: method({
        inputShape: createTunnelInput,
      }),
      dev: method({
        async body({ resource }) {
          const res = resource as LoadedResource<CreateTunnelInput>;
          const port = res.instance.inputs?.create?.port ?? 3000;
          return {
            port,
            url: effect({
              $effect: "function",
              description: "start ngrok",
              async body() {
                const url = await ngrok.connect(port);
                console.log(
                  `started ngrok:`,
                  url,
                  ">",
                  `http://localhost:${port}`
                );
                return url;
              },
            }),
          };
        },
      }),
    },
  };
}

export function tunnelPlugin(): Plugin {
  return {
    name: "tunneling",
    resourceDefinitions() {
      return [tunnel()];
    },
  };
}
