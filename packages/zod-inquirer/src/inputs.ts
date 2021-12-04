import inquirer from "inquirer";
import { z } from "zod";

export type InputSpec<T = {}> = {
  questions: inquirer.Question[];
  defaults: Partial<T>;
};

export async function fulfillMissingInputs<I = any>(spec: InputSpec<I>) {
  return inquirer.prompt(spec.questions, spec.defaults) as Promise<I>;
}

export function getQuestion(shape: z.ZodTypeAny): inquirer.Question {
  let defaultValue = void 0,
    message = "",
    type = "";
  const typesToQnType: { [k: string]: inquirer.Question["type"] } = {
    ZodString: "input",
    ZodNumber: "input",
    ZodBoolean: "confirm"
  };
  let next = shape;
  while (next && next?._def) {
    const { defaultValue: dv, description, typeName } = next._def;
    if (dv) {
      defaultValue = dv?.();
    }
    if (description) {
      message = description[description.length - 1] == ":"
        ? description
        : description + ":";
    }
    if (typeName) {
      type = typesToQnType[typeName] ?? typeName;
    }
    next = next._def?.innerType;
  }
  function validate(data: any) {
    const parsed = shape.safeParse(data);
    if (parsed.success === true) {
      return true;
    } else {
      return parsed.error.format()._errors?.join("\n");
    }
  }
  return { message, type, default: defaultValue, validate };
}

export function getQuestions(shape: z.ZodRawShape) {
  const q = [];
  for (let k in shape) {
    const v = shape[k];
    q.push({ ...getQuestion(v), name: k });
  }
  return q;
}

function noUndefined<T extends object>(o: T) {
  if (!o) return o;
  const r: T = {} as any;
  for (let i in o) {
    if (typeof o[i] !== 'undefined') {
      r[i] = o[i];
    }
  }
  return r;
}

export async function fulfillWithQuestions<
  T extends z.ZodObject<z.ZodRawShape> = z.AnyZodObject
>(obj: T, defaults?: z.infer<T>): Promise<z.infer<T>> {
  const questions = getQuestions(obj._def.shape());
  return noUndefined((await inquirer.prompt(questions, defaults)) ?? {});
}

