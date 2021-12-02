// package @nice/fx-teams
import { templateResources } from "@nice/fx";

import { manifest } from "./manifest.js";
import { tab } from "./tab.js";

export function teams() {
  return templateResources(manifest, tab);
}
