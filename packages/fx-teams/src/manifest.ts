import { z } from "@nice/fx";

export const manifestInput = z.object({
  outputDir: z.string().describe("choose a folder").default("./teams"),
  full: z
    .boolean()
    .describe("generate all the possible fields in the manifest")
    .default(false),
});

export type ManifestInput = z.infer<typeof manifestInput>;