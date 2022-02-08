import { z } from "zod";
import inquirer from "inquirer";
import { printResourceId } from "@fx/plugin";
import { LoadedConfig } from "./config";

export function generateResourceChoiceQuestions(
  config: LoadedConfig,
  shape: z.ZodTypeAny,
  key: string | number,
  merge?: Partial<inquirer.DistinctQuestion>
): inquirer.DistinctQuestion[] {
  const { defaultValue: dv, description, typeName } = shape._def;
  const question: inquirer.DistinctQuestion = {} as any;
  const result = [question];
  if (dv) {
    question.default = dv?.();
  }
  if (description) {
    question.message = description;
  }
  if (typeName) {
    if (typeName == "ZodLiteral") {
      const q = question as inquirer.ListQuestion;
      const resourceType = shape._def.value;
      const resources = config.getResources();
      const applicableResources = resources.filter(
        (res) => res.instance.type == resourceType
      );
      const applicableDefinitions = config
        .getResourceDefinitions()
        .filter((def) => def.type == resourceType);
      const resourceChoices = applicableResources.map((res) =>
        printResourceId(res.instance)
      );
      q.type = "list";
      q.choices = [
        ...resourceChoices,
        ...(applicableDefinitions?.length
          ? [`Create a new '${resourceType}'`]
          : []),
      ];
      q.default = 0;
    } else if (typeName == "ZodUnion") {
      const options = (shape as z.ZodUnion<any>)._def.options;
      const q = question as inquirer.ListQuestion;
      q.type = "list";
      q.name = key.toString();
      q.choices = options?.map((opt: z.ZodTypeAny) => {
        const { description } = opt._def;
        return description;
      });
      q.default = 0;

      options?.map((opt: z.ZodTypeAny, i: number) => {
        const followupQuestions = generateResourceChoiceQuestions(
          config,
          opt,
          key
        );
        followupQuestions?.forEach(q => q.when = (hash) => hash[key] == i);
        result.push(...followupQuestions);
      });
    }
  }
  return result;
}
