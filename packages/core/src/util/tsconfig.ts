import { JSONFile } from "@nice/plate";
// patch tsconfig to enable ts-node
// with commonjs module setting
export async function patchTsConfigForTsNode(cwd: string) {
  const f = new JSONFile<any>({
    path: cwd + "/tsconfig.json",
    transform(tsconfig) {
      // // add the following to tsconfig:
      // {
      //   "ts-node": {
      //     compilerOptions: {
      //       module: "commonjs",
      //     },
      //   },
      // };
      const tsnode = (tsconfig["ts-node"] = tsconfig["ts-node"] || {});
      const co = (tsnode.compilerOptions = tsnode.compilerOptions || {});
      co.module = "commonjs";
      return tsconfig;
    },
  });
  await f.save();
}
