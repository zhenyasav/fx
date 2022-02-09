import path from "path";
import { Plugin } from "@fx/plugin";
import { template } from "@fx/templates";

import { manifest } from "./manifest";
import { tabInput } from "./inputs/tab";
import { botService } from "@fx/bots";
import { tunnel } from "@fx/tunnel";
import { teamsBot } from "./teamsBot";

export function teams(): Plugin {
  return {
    name: "teams",
    resources() {
      return [
        teamsBot(),
        botService(),
        tunnel(),
        manifest(),
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
