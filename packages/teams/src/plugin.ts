import { Plugin } from "@fx/plugin";
import { botService } from "@fx/bots";
import { manifest } from "./manifest";
import { teamsBot } from "./teamsBot";
import { tab } from "./tab";
import { tunnel } from "@fx/tunnel";
import { aadAppRegistration } from "@fx/aad";

export { manifest, tab, teamsBot, botService, tunnel, aadAppRegistration };

export function teams(): Plugin {
  return {
    name: "teams",
    resourceDefinitions() {
      return [
        manifest(),
        tab(),
        teamsBot(),
        botService(),
        tunnel(),
        aadAppRegistration(),
      ];
    },
  };
}
