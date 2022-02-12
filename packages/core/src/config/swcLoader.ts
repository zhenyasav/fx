import { Loader } from "cosmiconfig";
// import register from "@swc/register";
// import TypeScriptCompileError from "./Errors/TypeScriptCompileError";

export const swcLoader: () => Loader = () => {
  const conf = {
    jsc: {
      target: "es5",
    },
  };
  console.log("swc", conf);
  // (register as any)?.(conf);
  return (filePath: string) => {
    try {
      const result = require(filePath);
      return result?.default ?? result;
    } catch (error) {
      throw error;
    }
  };
};
