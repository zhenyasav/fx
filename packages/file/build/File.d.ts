export declare type FileOptions<D> = {
    path: string | string[];
    copyFrom?: string | string[];
    content?: string;
    parsed?: D;
    overwrite?: boolean;
};
export declare class File<D = any> {
    content: string;
    parsed: D | null;
    path: string;
    name: string;
    root: string;
    dir: string;
    base: string;
    ext: string;
    overwrite: boolean;
    sourcePath: string;
    constructor(options: FileOptions<D>);
    isLoaded(): boolean;
    isCopy(): boolean;
    save(): Promise<void>;
    load(loadOptions?: any): Promise<File<D>>;
    protected parse(content: string, loadOptions?: any): Promise<D>;
    protected serialize(): Promise<string>;
    shortDescription(): string;
}
