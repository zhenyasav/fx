// package @nice/fx-teams
import { templateResources } from "@nice/fx";
import * as path from "path";
import { manifestInput } from "./manifest.js";
import { tabInput } from "./tab.js";
import { fileURLToPath } from "url";

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
