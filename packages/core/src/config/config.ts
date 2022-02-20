import {
  Config,
  LoadedConfiguration,
} from "@fx/plugin";
import { cosmiconfig } from "cosmiconfig";
import tsloader from "@endemolshinegroup/cosmiconfig-typescript-loader";
import { createLoadedConfiguration } from "./api";

// import { swcLoader } from "./swcLoader";
// const swcloader = swcLoader();

export type ConfigLoaderOptions = {
  cwd?: string;
  configFile?: string;
};

export type ConfigLoaderResult = {
  config: Config;
  filepath: string;
  isEmpty: boolean;
};

export class ConfigLoader {
  private cosmiconfig = cosmiconfig("fx", {
    searchPlaces: [
      `.#.json`,
      `.#.yaml`,
      `.#.yml`,
      `.#.ts`,
      `.#.js`,
      `.#rc`,
      `.#rc.json`,
      `.#rc.yaml`,
      `.#rc.yml`,
      `.#rc.ts`,
      `.#rc.js`,
      `#.config.ts`,
      `#.config.js`,
      "package.json",
    ].map((s) => s.replace("#", "fx")),
    loaders: {
      ".ts": tsloader,
      // ".ts": swcloader,
    },
  });
  private async loadCosmiconfig(
    options?: ConfigLoaderOptions
  ): Promise<ConfigLoaderResult | undefined> {
    const { cwd, configFile } = {
      cwd: process.cwd(),
      configFile: null,
      ...options,
    };
    if (configFile || cwd) {
      const file = configFile
        ? await this.cosmiconfig.load(configFile)
        : await this.cosmiconfig.search(cwd);
      if (file) {
        const { config, filepath, isEmpty } = file;
        return { config: config as Config, filepath, isEmpty: !!isEmpty };
      }
    } else {
      throw new Error("either cwd or configFile must be specifed");
    }
  }
  public async load(
    options?: ConfigLoaderOptions
  ): Promise<LoadedConfiguration | undefined> {
    const result = await this.loadCosmiconfig(options);
    if (result) {
      const { config, filepath } = result;
      return createLoadedConfiguration({
        config,
        configFilePath: filepath,
      });
    }
  }
}

