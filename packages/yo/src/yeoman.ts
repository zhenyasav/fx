import { z } from "zod";
import { Plugin, method } from "@fx/plugin";

export function yeoman(): Plugin {
  return {
    name: `yo`,
    async resources() {
      return [
        {
          name: `generator`,
          methods: {
            create: method({
              input: z.object({
                name: z
                  .string()
                  .describe("name of the yeoman generator template to use"),
              }),
              execute({ input }) {
                const { name } = input;
                return {
                  description: `yo ${name}`,
                  effects: [
                    {
                      type: "shell",
                      command: "echo 'foo'"
                    }
                  ]
                };
              },
            }),
          },
        },
      ];
    },
  };
}

