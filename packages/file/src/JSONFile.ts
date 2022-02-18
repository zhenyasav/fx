import { File } from "./File";

export class JSONFile<T> extends File<T> {
  protected async serialize(): Promise<string> {
    return JSON.stringify(this.content, null, 2);
  }
  protected async parse(content: Buffer, loadOptions?: any): Promise<T> {
    return JSON.parse(content.toString('utf8'));
  }
}
