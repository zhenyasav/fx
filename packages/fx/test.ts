import { z } from "zod";

const shape = z.string().describe("enter your name").default("foo");

function getQuestion(shape: z.ZodTypeAny) {
  const message = shape._def.innerType._def.description;
  const def = shape._def.defaultValue();
  const typestr = shape._def.innerType._def.typeName;
  
  console.log('message', message);
  console.log('default', def);
  console.log('type', typestr);
  console.log('---');
  console.log("shape", shape);
}

getQuestion(shape);
