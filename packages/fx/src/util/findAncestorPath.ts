import * as path from "path";
import { promises as fs } from "fs";

export async function findAncestorPath(search: string) {
  let cd = process.cwd();
  while (cd && cd.split("/").length) {
    try {
      const exists = await fs.stat(path.resolve(cd, search));
      if (exists) {
        return path.resolve(cd, search);
      }
    } catch (err) {}
    cd = path.dirname(cd);
  }
  return null;
}