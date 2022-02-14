import { z } from "zod";
import { Config, method, effect } from "@fx/plugin";

const config: Config = {
  plugins: [
    {
      name: "local",
      resources() {
        return [
          {
            type: "foo",
            methods: {
              create: method({
                inputShape: z.object({
                  ok: z.boolean().describe('is it ok')
                }),
                body() {
                  return {
                    url: "foo",
                    functionValue: effect({
                      $effect: "function",
                      description:
                        "fire off an async function and return a value",
                      async body() {
                        console.log("foo function fired body");
                        return "func-returned-value";
                      },
                    }),
                  };
                },
              }),
            },
          },
          {
            type: "bar",
            methods: {
              create: method({
                inputShape: z.object({
                  myFoo: z.literal("foo").describe("specify a foo"),
                }),
                body({ input }) {
                  return {
                    myFoo: effect({
                      $effect: "function",
                      description: "return an input slowly",
                      async body() {
                        return input.myFoo;
                      },
                    }),
                  };
                },
              }),
            },
          },
          { type: "zoo" },
        ];
      },
    },
  ],
};

export default config;
