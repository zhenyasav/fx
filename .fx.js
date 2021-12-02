import path from "path";
import { fileURLToPath } from 'url';
import { templateResource } from "@nice/fx";
import { teams } from "@nice/fx-teams";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  plugins: [
    teams(),
    templateResource({
      name: "package",
      description: "creates a new typescript package in ./packages/",
      templateDir: path.resolve(__dirname, "templates/package"),
      outputDir: path.resolve(__dirname, "packages")
    }),
  ],
};
