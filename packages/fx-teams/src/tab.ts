import * as path from "path";
import { fileURLToPath } from "url";
import { z, TemplateResourceOptions } from "@nice/fx";

export const tabInput = z.object({
  outputDir: z.string().describe("choose a folder").default("./teams"),
});

export type TabInput = z.infer<typeof tabInput>;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const tab: TemplateResourceOptions<typeof tabInput> = {
  typeName: "tab",
  description: "Add a staticTabs declaration to your Teams manifest",
  templateDir: path.resolve(__dirname, "../templates/tab"),
  input: tabInput
};