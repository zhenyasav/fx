import { z } from "zod";
import { getQuestion } from "./src/util/inputs.js";

const shape = z.string().describe("this is a string").optional();

console.log(getQuestion(shape));
console.log(shape);
console.log(shape._def.innerType);
