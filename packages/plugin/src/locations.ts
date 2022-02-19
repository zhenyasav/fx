export type Location<T> = {
  entity: T;
  path: (string | number)[];
};

export function getPatternLocations<T>(
  o: { [k: string]: any },
  predicate: (o: any) => boolean
): Location<T>[] {
  if (typeof o != "object") return [];
  const results: Location<T>[] = [];
  for (let i in o) {
    const v = o[i];
    if (predicate(v)) {
      results.push({ entity: v as T, path: [i] });
    } else if (Array.isArray(v)) {
      const entitiesInArray = v.filter(predicate);
      results.push(
        ...entitiesInArray.map((e, x) => ({
          entity: e as T,
          path: [i, x],
        }))
      );
    }
  }
  return results;
}
