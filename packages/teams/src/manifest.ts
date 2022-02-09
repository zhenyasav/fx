import sample from "./fixtures/manifest.json";
import { template } from "@fx/templates";
import { manifestInput } from "./inputs/manifest";
import path from "path";

export type Manifest = typeof sample;

export function manifest() {
  return template({
    name: "manifest",
    description: "Create a Teams manifest template and build scripts",
    templateDirectory: path.resolve(__dirname, "../templates/manifest"),
    input: manifestInput,
    outputDirectory(input) {
      return input.directory;
    }
  });
}
