import path from "path";
import { Plugin } from "@fx/plugin";
import { template } from "@fx/templates";
import { manifestInput } from "./inputs/manifest";
import { tabInput } from "./inputs/tab";
import { botRegistration } from "@fx/bots";
import { tunnel } from "@fx/tunnel";
import { teamsBot } from "./teamsBot";

export function teams(): Plugin {
  return {
    name: "teams",
    resources() {
      return [
        teamsBot(),
        botRegistration(),
        tunnel(),
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
