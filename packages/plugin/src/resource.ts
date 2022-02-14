export type ResourceInstance<TCreateArgs = any> = {
  id: string;
  type: string;
  inputs?: { create?: TCreateArgs } & { [methodName: string]: any };
  outputs?: any;
};
