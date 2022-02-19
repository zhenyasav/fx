export function ensurePath(obj: any, path: any[]) {
  if (!path || !path.length) return obj;
  let c = obj;
  for (let i = 0; i < path.length - 1; i++) {
    const p = path[i];
    c[p] = c = c?.[p] ?? (typeof path[i + 1] == "number" ? [] : {});
  }
  return c;
}
