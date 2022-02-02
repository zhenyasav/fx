import { File } from "./File";
export declare class JSONFile<T> extends File<T> {
    protected serialize(): Promise<string>;
    protected parse(content: string, loadOptions?: any): Promise<T>;
}
