// package @nice/fx-teams
import { templateResource } from "@nice/fx";

import * as path from "path";
import { fileURLToPath } from "url";
import { input } from "./input.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function teams() {
  return templateResource({
    typeName: 'manifest',
    description: "Create a Teams manifest template and build scripts",
    templateDir: path.resolve(__dirname, '../template'),
    input
  });
}