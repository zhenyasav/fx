import { Plugin } from "@fx/plugin";

export function aad(): Plugin {
  return {
    name: "Azure Active Directory",
    async resources() {
      return [];
    },
  };
}
