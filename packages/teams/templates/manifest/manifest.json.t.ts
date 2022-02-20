import { TemplateFunction } from "@nice/plate";
import { Manifest } from "../../src/manifest";
import { ManifestInput } from "../../src/inputs/manifest";
import { v4 as uuid } from "uuid";

const template: TemplateFunction<ManifestInput> = async (context) => {
  const {
    input: {
      description,
      name,
      developerName,
      packageName,
    },
  } = context;

  const id = uuid();

  const manifest: Partial<Manifest> = {
    $schema:
      "https://developer.microsoft.com/json-schemas/teams/v1.11/MicrosoftTeams.schema.json",
    manifestVersion: "1.11",
    version: "1.0.0",
    id,
    packageName,
    developer: {
      name: developerName,
      privacyUrl: "https://privacy.microsoft.com/en-us/privacystatement",
      termsOfUseUrl: "https://www.microsoft.com/en-us/legal/terms-of-use",
      websiteUrl: "https://microsoft.com",
      mpnId: "",
    },
    accentColor: "#7B83EB",
    name: {
      short: name,
      full: name
    },
    description: {
      short: description,
      full: description,
    },
    icons: {
      outline: "resources/color.png",
      color: "resources/color.png",
    },
  };

  return JSON.stringify(manifest, null, 2);
};

export default template;
