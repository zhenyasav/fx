import path from "path";
import { Plugin } from "@fx/plugin";
import { template } from "@fx/templates";
import { manifestInput } from "./manifest.js";
import { tabInput } from "./tab.js";
// import { aadAppRegistration } from "@fx/aad";
// import { yogenerator } from "@fx/yo";

export function teams(): Plugin {
  return {
    name: "teams",
    resources() {
      return [
        // yogenerator({ name: 'teams' }),
        // aadAppRegistration(),
        template({
          name: "manifest",
          description: "Create a Teams manifest template and build scripts",
          templateDirectory: path.resolve(__dirname, "../templates/manifest"),
          input: manifestInput,
        }),
        template({
          name: "tab",
          description: "Add a staticTabs declaration to your Teams manifest",
          templateDirectory: path.resolve(__dirname, "../templates/tab"),
          input: tabInput,
        }),
      ];
    },
  };
}
