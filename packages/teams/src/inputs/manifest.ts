import { z } from "zod";
import os from "os";

const username = os.userInfo().username;

export const manifestInput = z.object({
  name: z.string().describe("enter a short, friendly application name"),
  description: z
    .string()
    .describe("enter a friendly application description")
    .default("An app built with Teams Toolkit"),
  packageName: z
    .string()
    .describe("enter a package name like com.example.myapp")
    .default(`com.${username}.app`),
  developerName: z
    .string()
    .describe("enter your publisher name")
    .default(username),
  directory: z
    .string()
    .describe("choose a folder where to store the manifest and icons")
    .default("./teams-manifest"),
  buildDirectory: z
    .string()
    .describe("choose a folder where to produce the teams app zip bundle")
    .default("./teams-manifest/build"),
});

export type ManifestInput = z.infer<typeof manifestInput>;
