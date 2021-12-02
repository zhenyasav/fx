import * as path from "path";
import { fileURLToPath } from "url";
import { z, TemplateResourceOptions } from "@nice/fx";

export const manifestInput = z.object({
  outputDir: z.string().describe("choose a folder").default("./teams"),
  full: z
    .boolean()
    .describe("generate all the possible fields in the manifest")
    .default(false),
});

export type ManifestInput = z.infer<typeof manifestInput>;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const manifest: TemplateResourceOptions<typeof manifestInput> = {
    typeName: "manifest",
    description: "Create a Teams manifest template and build scripts",
    templateDir: path.resolve(__dirname, "../templates/manifest"),
    input: manifestInput,
  }