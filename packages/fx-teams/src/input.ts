import { z } from "@nice/fx";

export const input = z.object({
  outputDir: z.string().describe("choose a folder").default("./teams"),
  full: z
    .boolean()
    .describe("generate all the possible fields in the manifest")
    .default(false),
});

export type Input = z.infer<typeof input>;
