export type PromiseFn<R = any> = (...args: any[]) => Promise<R>;

export function promiseOnce<TFn extends PromiseFn = PromiseFn>(fun: TFn): TFn {
  let promise: Promise<any>;
  let value: any;
  return (async (...args) => {
    if (value) return value;
    if (promise) return promise;
    promise = fun(...args);
    return promise;
  }) as TFn;
}
