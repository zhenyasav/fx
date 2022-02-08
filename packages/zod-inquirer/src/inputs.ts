import { z } from "zod";
import inquirer from "inquirer";

export type InputSpec<T = {}> = {
  questions: inquirer.Question[];
  defaults: Partial<T>;
};

export async function fulfillMissingInputs<I = any>(spec: InputSpec<I>) {
  return inquirer.prompt(spec.questions, spec.defaults) as Promise<I>;
}

export function getQuestion(shape: z.ZodTypeAny): inquirer.Question | null {
  let defaultValue = void 0,
    message = "",
    type: string | undefined = void 0;
  const typesToQnType: { [k: string]: inquirer.Question["type"] } = {
    ZodString: "input",
    ZodNumber: "number",
    ZodBoolean: "confirm",
  };
  let next = shape;
  while (next && next?._def) {
    const { defaultValue: dv, description, typeName } = next._def;
    if (typeName) {
      if (typeName in typesToQnType) {
        type = typesToQnType[typeName];
      } else {
        return null;
      }
    }
    if (dv) {
      defaultValue = dv?.();
    }
    if (description) {
      message =
        description[description.length - 1] == ":"
          ? description
          : description + ":";
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

export type QuestionGenerator<T = any> = (
  shape: T[keyof T],
  key: keyof T
) => inquirer.DistinctQuestion[] | undefined;

export function getQuestions(
  shape: z.ZodRawShape,
  defaultGenerator?: QuestionGenerator<z.ZodRawShape>
) {
  const q = [];
  for (let k in shape) {
    const v = shape[k];
    const qqn = getQuestion(v);
    if (qqn) {
      q.push({ ...qqn, name: k });
    } else {
      const qqns = defaultGenerator?.(v, k);
      if (qqns) q.push(...qqns);
    }
  }
  return q;
}

function noUndefined<T extends object>(o: T) {
  if (!o) return o;
  const r: T = {} as any;
  for (let i in o) {
    if (typeof o[i] !== "undefined") {
      r[i] = o[i];
    }
  }
  return r;
}

export async function inquire<
  T extends z.ZodObject<z.ZodRawShape> = z.ZodObject<z.ZodRawShape>
>(
  shape: T,
  options?: {
    defaults?: Partial<z.infer<T>>;
    questionGenerator?: QuestionGenerator<z.infer<T>>;
  }
): Promise<z.infer<T>> {
  const questions = getQuestions(
    shape._def.shape(),
    options?.questionGenerator
  );
  return noUndefined(
    (await inquirer.prompt(questions, options?.defaults)) ?? {}
  );
}
