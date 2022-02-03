export declare type PromiseFn<R = any> = (...args: any[]) => Promise<R>;
export declare function promiseOnce<TFn extends PromiseFn = PromiseFn>(fun: TFn): TFn;
