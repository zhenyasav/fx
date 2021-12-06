import { promises as fs } from "fs";
import * as path from "path";
import mkdirp from "mkdirp";
import { relative, fileExists, ellipsis, kib } from "./utils.js"

export type FileOptions<D> = {
  path: string | string[];
  sourcePath?: string | string[];
  content?: string;
  parsed?: D;
  overwrite?: boolean;
};

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
  public sourcePath: string = "";
  constructor(options: FileOptions<D>) {
    const {
      path: p,
      content,
      parsed,
      sourcePath,
      overwrite,
    } = { overwrite: true, ...options };
    this.path = Array.isArray(p) ? path.join(...p) : p;
    if (!this.path) throw new Error("File must have an output path");
    if (sourcePath) {
      this.sourcePath = Array.isArray(sourcePath)
        ? path.join(...sourcePath)
        : sourcePath ?? "";
    }
    if (content) this.content = content;
    if (parsed) this.parsed = parsed;
    const { root, base, dir, ext, name } = path.parse(this.path);
    Object.assign(this, { root, base, dir, ext, name });
    this.overwrite = overwrite;
  }
  isLoaded() {
    return this.content != null;
  }
  isCopy() {
    return !!this.sourcePath && !this.content && !this.parsed;
  }
  async save() {
    if (this.isCopy()) {
      await mkdirp(path.dirname(this.path));
      await fs.copyFile(this.sourcePath, this.path);
      console.info(`copied ${ellipsis(relative(this.path))}`);
    } else {
      const text = this.parsed !== null ? await this.serialize() : this.content;
      this.content = text;
      if (this.content) {
        const parsedPath = path.parse(this.path);
        const exists = await fileExists(this.path);
        if (exists && !this.overwrite)
        throw new Error("file save failed, file exists: " + this.path);
        if (!exists) await mkdirp(parsedPath.dir);
        let handle;
        try {
          handle = await fs.open(this.path, "w");
          await handle.writeFile(text, "utf-8");
          console.info("wrote", this.shortDescription());
        } finally {
          handle?.close();
        }
      }
    }
  }
  async load(loadOptions?: any): Promise<File<D>> {
    const handle = await fs.open(this.path, "r");
    this.content = await handle.readFile("utf-8");
    handle.close();
    this.parsed = await this.parse(this.content, loadOptions);
    console.info("loaded", this.shortDescription());
    return this;
  }
  async parse(content: string, loadOptions?: any): Promise<D> {
    return content as any;
  }
  async serialize(): Promise<string> {
    return this.content;
  }
  shortDescription() {
    return `${ellipsis(relative(this.dir))}/${this.name}${
      this.ext
    }: ${kib(this.content?.length ?? 0)}`;
  }
}