import { templateResources } from "@fx/templates";
import * as path from "path";
import { fileURLToPath } from "url";
import { manifestInput } from "./manifest.js";
import { tabInput } from "./tab.js";
export * from "@fx/plugin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function teams() {
  return templateResources(
    {
      typeName: "manifest",
      description: "Create a Teams manifest template and build scripts",
      templateDir: path.resolve(__dirname, "../templates/manifest"),
      input: manifestInput,
    },
    {
      typeName: "tab",
      description: "Add a staticTabs declaration to your Teams manifest",
      templateDir: path.resolve(__dirname, "../templates/tab"),
      input: tabInput,
    }
  );
}
