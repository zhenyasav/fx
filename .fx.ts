import {
  z,
  Config,
  effect,
  method,
  ResourceDefinition,
} from "@fx/core";
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
          stdout: effect({
            $effect: "shell",
            command: `npx cowsay "${input.what}"`,
            description: `cowsay ${input.what}`,
          }),
        };
      },
    }),
    moo: method({
      // implies: ["build"],
      body({ resource }) {
        const what = resource.instance.inputs?.create?.what;
        return {
          stdout: effect({
            $effect: "shell",
            description: "say the thing",
            command: `npx cowsay ${what}`,
          }),
        };
      },
    }),
  },
};

const config: Config = {
  plugins: [teams()],
  resources: [packageTemplate(), cowsay],
};

export default config;
