// import path from "path";
import { Plugin } from "@fx/plugin";
import { botService } from "@fx/bots";
import { manifest } from "./manifest";
// import { template } from "@fx/templates";
// import { tabInput } from "./inputs/tab";
import { teamsBot } from "./teamsBot";
import { tab } from "./tab";
import { tunnel } from "@fx/tunnel";

export function teams(): Plugin {
  return {
    name: "teams",
    resourceDefinitions() {
      return [
        manifest(),
        tab(),
        teamsBot(),
        botService(),
        tunnel()
      ];
    },
  };
}
