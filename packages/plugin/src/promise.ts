export type MaybePromise<T> = T | Promise<T>;

export function isPromise<T>(p: any): p is Promise<T> {
  return typeof p?.then == "function";
}

export function promise<T>(p: MaybePromise<T>): Promise<T> {
  return isPromise(p) ? p : Promise.resolve(p);
}
