import { z, Config, effect, method, ResourceDefinition, isResourceReference } from "@fx/core";
import { packageTemplate } from "./templates/package/template.t";
import { teams } from "@fx/teams";

const inputShape = z.object({
  what: z.string().describe("what to say").default("moo"),
  tunnel: z.literal('before:tunnel').describe('select a tunnel')
});

type CowsayInput = z.infer<typeof inputShape>;

const cowsay: ResourceDefinition<CowsayInput> = {
  type: "cow",
  description: "a cow that says stuff",
  methods: {
    create: method({
      inputShape,
      body({ input }) {
        return {
          say: input.what,
          shell: effect({
            $effect: "shell",
            // command: `npx cowsay "${input.what}"`,
            command: 'yo teams',
            description: `the friendly cow will say: ${input.what}`,
          }),
        };
      },
    }),
    dev: method({
      body({ resource, config }) {
      const what = resource.instance.inputs?.create?.what;
      const tunnel = resource.instance.inputs?.create?.tunnel;
      if (!isResourceReference(tunnel)) return;
      const res = config.getResource(tunnel);
      const port = res?.instance.inputs?.create.port;
        return {
          say: what,
          shell: effect({
            $effect: "shell",
            command: `npx cowsay ${what} and the port of the tunnel is ${port}`,
          }),
        };
      },
    }),
  },
};

const npmStartInput = z.object({
  tunnel: z
    .literal("before:tunnel")
    .describe("the tunnel resource for the port number to npm start with"),
});

type NpmStartInput = z.infer<typeof npmStartInput>;

const npmStart: ResourceDefinition<NpmStartInput> = {
  type: "npm-start",
  description: "runs npm start",
  methods: {
    create: method({
      inputShape: npmStartInput,
    }),
    dev: method({
      body({ resource, config }) {
        const tunnelRef = resource.instance.inputs?.create?.tunnel as any;
        const tunnel = config.getResource(tunnelRef);
        const port: number = tunnel?.instance.inputs?.create.port;
        return {
          result: effect({
            $effect: "shell",
            command: `PORT=${port} npm start`,
            description: "runs npm start",
            async: true,
          }),
        };
      },
    }),
  },
};

const config: Config = {
  plugins: [teams()],
  resourceDefinitions: [packageTemplate(), cowsay, npmStart],
};

export default config;
