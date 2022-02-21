import { z, Config, effect, method, ResourceDefinition } from "@fx/core";
import { packageTemplate } from "./templates/package/template.t";
import { teams } from "@fx/teams";

const inputShape = z.object({
  what: z.string().describe("what to say").default("moo"),
});

type CowsayInput = z.infer<typeof inputShape>;

const cowsay: ResourceDefinition<CowsayInput> = {
  type: "cowsay",
  description: "a cow that says",
  methods: {
    create: method({
      inputShape,
      body({ input }) {
        return {
          say: input.what,
          shell: effect({
            $effect: "shell",
            command: `npx cowsay "${input.what}"`,
            description: `cowsay ${input.what}`,
          }),
        };
      },
    }),
    moo: method({
      body({ resource }) {
        const what = resource.instance.inputs?.create?.what;
        return {
          say: what,
          shell: effect({
            $effect: "shell",
            description: "say the thing",
            command: `npx cowsay ${what}`,
          }),
        };
      },
    }),
  },
};

const npmStart: ResourceDefinition = {
  type: "npm-start",
  description: "runs npm start",
  methods: {
    dev: method({
      body() {
        return {
          result: effect({
            $effect: "shell",
            command: "npm start",
            description: "runs npm start",
            async: true,
          }),
        };
      },
    }),
  },
};

const config: Config & any = {
  plugins: [teams()],
  resources: [packageTemplate(), cowsay, npmStart],
  instances: [
    {
      id: "main-start",
      type: "npm-start",
    },
  ],
};

export default config;
