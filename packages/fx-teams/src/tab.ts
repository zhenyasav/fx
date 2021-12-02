import { z } from "@nice/fx";

export const tabInput = z.object({
  outputDir: z.string().describe("choose a folder").default("./teams"),
});

export type TabInput = z.infer<typeof tabInput>;