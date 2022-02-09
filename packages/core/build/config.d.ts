import { LoadedConfig } from "@fx/plugin";
export declare type ConfigLoaderOptions = {
    cwd?: string;
    configFile?: string;
};
export declare class ConfigLoader {
    private cosmiconfig;
    load(options?: ConfigLoaderOptions): Promise<LoadedConfig>;
}
