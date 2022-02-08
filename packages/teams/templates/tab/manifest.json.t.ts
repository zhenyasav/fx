import { TemplateFunction } from "@nice/ts-template";
import { TabInput } from "../../src/inputs/tab";

const template: TemplateFunction<TabInput> = async (context) => {
  // const { input } = context;
  const manifest = {
    staticTabs: [
      {
        entityId: "unique Id for the page entity",
        scopes: ["personal"],
        context: ["personalTab", "channelTab"],
        name: "Display name of tab",
        contentUrl: "https://contoso.com/content (displayed in Teams canvas)",
        websiteUrl: "https://contoso.com/content (displayed in web browser)",
        searchUrl: "https://contoso.com/content (displayed in web browser)",
      },
    ],
    validDomains: [
      "contoso.com",
      "mysite.someplace.com",
      "othersite.someplace.com",
    ],
    showLoadingIndicator: false,
    isFullScreen: false,
  };

  return JSON.stringify(manifest, null, 2);
};

export default template;
