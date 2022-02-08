export function compact(array: any[]) {
  if (!Array.isArray(array)) return array;
  return array.reduce((memo, v) => v ? memo.concat(v) : memo, []);
}