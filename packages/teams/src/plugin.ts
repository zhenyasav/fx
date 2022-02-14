// import path from "path";
import { Plugin } from "@fx/plugin";
import { botService } from "@fx/bots";
// import { template } from "@fx/templates";
// import { manifest } from "./manifest";
// import { tabInput } from "./inputs/tab";
// import { teamsBot } from "./teamsBot";
// import { tab } from "./tab";
import { tunnel } from "@fx/tunnel";

export function teams(): Plugin {
  return {
    name: "teams",
    resources() {
      return [
        // manifest(),
        // tab(),
        // teamsBot(),
        botService(),
        tunnel(),
        // template({
        //   name: "tab",
        //   description: "Add a staticTabs declaration to your Teams manifest",
        //   templateDirectory: path.resolve(__dirname, "../templates/tab"),
        //   input: tabInput,
        // }),
      ];
    },
  };
}
