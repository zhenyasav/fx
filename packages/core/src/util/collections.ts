export function compact(array: any[]) {
  if (!Array.isArray(array)) return array;
  return array.reduce((memo, v) => (v ? memo.concat(v) : memo), []);
}

export function uniq(array: any[]) {
  const m = new Map();
  array.forEach((a) => m.set(a, true));
  return Array.from(m.keys());
}
