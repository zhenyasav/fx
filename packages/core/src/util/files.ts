import path from "path";
import { promises as fs } from "fs";

export function relative(s: string) {
  return path.relative(process.cwd(), s);
}

export async function fileExists(file: string): Promise<boolean> {
  try {
    const stat = await fs.stat(file);
    if (stat) return true;
  } catch (err) {
    return false;
  }
  return false;
}

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