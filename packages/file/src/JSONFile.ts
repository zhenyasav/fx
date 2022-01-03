import { File } from "./File";

export class JSONFile<T> extends File<T> {
  protected async serialize(): Promise<string> {
    return JSON.stringify(this.parsed, null, 2);
  }
  protected async parse(content: string, loadOptions?: any): Promise<T> {
    return JSON.parse(content);
  }
}
