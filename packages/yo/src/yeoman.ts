import { method, ResourceDefinition } from "@fx/plugin";
import { z } from "zod";

export const yoInput = z.object({
  generator: z.string().describe("the name of the generator"),
});

export type YoInput = z.infer<typeof yoInput>;

export function yogenerator(): ResourceDefinition {
  return {
    type: "foo",
    methods: {
      create: method({
        inputShape: yoInput,
        execute({ input }) {
          return {
            description: `runs the ${input.generator} yo generator`,
            effects: [],
          };
        },
      }),
    },
  };
}
