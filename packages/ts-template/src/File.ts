import { promises as fs } from "fs";
import * as path from "path";
import mkdirp from "mkdirp";

export interface LoadOptions {}

export type FileOptions<D> = {
  path: string | string[];
  content?: string;
  parsed?: D;
  overwrite?: boolean;
};

const fileExists = async (path: string) => {
  try {
    await fs.stat(path);
  } catch (err) {
    return false;
  }
  return true;
};

const ellipsis = (s: string, n = 30) =>
  s.length > n
    ? s.slice(0, n / 2 - 3) + "..." + s.slice(s.length - n / 2 - 3)
    : s;

const kib = (bytes: number) => `${Math.round(bytes / 1024)} KiB`;

export class File<D = any> {
  public content: string = "";
  public parsed: D | null = null;
  public path: string = "";
  public name: string = "";
  public root: string = "";
  public dir: string = "";
  public base: string = "";
  public ext: string = "";
  public overwrite: boolean;
  constructor(options: FileOptions<D>) {
    const {
      path: p,
      content,
      parsed,
      overwrite,
    } = { overwrite: true, ...options };
    this.path = Array.isArray(p) ? path.join(...p) : p;
    if (!this.path) throw new Error("File must have an output path");
    if (content) this.content = content;
    if (parsed) this.parsed = parsed;
    const { root, base, dir, ext, name } = path.parse(this.path);
    Object.assign(this, { root, base, dir, ext, name });
    this.overwrite = overwrite;
  }
  isLoaded() {
    return this.content != null;
  }
  async save() {
    const parsedPath = path.parse(this.path);
    const exists = await fileExists(this.path);
    if (exists && !this.overwrite)
      throw new Error("file save failed, file exists: " + this.path);
    if (!exists) await mkdirp(parsedPath.dir);
    const handle = await fs.open(this.path, "w");
    const text = this.parsed !== null ? await this.serialize() : this.content;
    this.content = text;
    if (!this.content || !this.content.length) {
      console.warn("skipping writing file, contents empty: " + this.path);
      return;
    }
    await handle.writeFile(text, "utf-8");
    handle.close();
    console.info("wrote", this.shortDescription());
  }
  async load(loadOptions?: LoadOptions): Promise<File<D>> {
    const handle = await fs.open(this.path, "r");
    this.content = await handle.readFile("utf-8");
    handle.close();
    this.parsed = await this.parse(this.content, loadOptions);
    console.info("loaded", this.shortDescription());
    return this;
  }
  async parse(content: string, loadOptions?: LoadOptions): Promise<D> {
    return content as any;
  }
  async serialize(): Promise<string> {
    return this.content;
  }
  shortDescription() {
    return `${ellipsis(this.dir)}/${this.name}${this.ext}: ${kib(
      this.content?.length ?? 0
    )}`;
  }
}
