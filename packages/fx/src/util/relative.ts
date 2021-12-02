import * as path from "path";
export function relative(s: string) {
  return path.relative(process.cwd(), s);
}
