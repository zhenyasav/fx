export declare type MaybePromise<T> = T | Promise<T>;
export declare function isPromise<T>(p: any): p is Promise<T>;
export declare function promise<T>(p: MaybePromise<T>): Promise<T>;
