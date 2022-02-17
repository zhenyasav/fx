import { z } from "zod";
import inquirer from "inquirer";
import { resourceId, QuestionGenerator } from "@fx/plugin";
import { LoadedConfiguration } from "@fx/plugin";

export function getResourceQuestionGenerator(
  config: LoadedConfiguration
): QuestionGenerator {
  return (shape, key) =>
    generateResourceChoiceQuestions(config, shape, key.toString());
}

export function generateResourceChoiceQuestions(
  config: LoadedConfiguration,
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
    if (typeName == "ZodNumber") {
      const q = question as inquirer.NumberQuestion;
      q.type = "number";
      q.name = key.toString();
    } else if (typeName == "ZodString") {
      const q = question as inquirer.InputQuestion;
      q.type = "input";
      q.name = key.toString();
    } else if (typeName == "ZodLiteral") {
      const q = question as inquirer.ListQuestion;
      const resourceType = shape._def.value;
      const resources = config.getResources();
      const applicableResources = resources.filter(
        (res) => res.instance.type == resourceType
      );
      const applicableDefinitions = config
        .getResourceDefinitions()
        .filter((def) => def.type == resourceType);
      const resourceChoices = applicableResources.map((res) => ({
        type: "choice" as "choice",
        name: resourceId(res.instance),
        value: { $resource: resourceId(res.instance) },
      }));
      q.type = "list";
      q.name = key.toString();
      const choices = [
        ...resourceChoices,
        ...(applicableDefinitions?.length
          ? [
              {
                type: "choice" as "choice",
                name: `Create a new '${resourceType}'`,
                value: { $resource: resourceType },
              },
            ]
          : []),
      ];
      q.choices = choices;
      q.default = 0;
    } else if (typeName == "ZodUnion") {
      const { options, description } = (shape as z.ZodUnion<any>)._def;
      const q = question as inquirer.ListQuestion;
      q.type = "list";
      q.name = `${key.toString()}-type`;
      q.message = description;
      const choices = options?.map((opt: z.ZodTypeAny) => {
        const { description, typeName } = opt._def;
        const choice: inquirer.ListChoiceOptions = {
          type: "choice",
          name: description,
          value:
            typeName == "ZodString"
              ? "string"
              : typeName == "ZodNumber"
              ? "number"
              : typeName == "ZodLiteral"
              ? opt._def.value
              : description,
        };
        return choice;
      });
      q.choices = choices;
      q.default = 0;

      options?.map((opt: z.ZodTypeAny, i: number) => {
        const followupQuestions = generateResourceChoiceQuestions(
          config,
          opt,
          key
        );
        followupQuestions?.forEach(
          (fq) =>
            (fq.when = (hash) => {
              return hash[`${key}-type`] == choices[i].value;
            })
        );
        result.push(...followupQuestions);
      });
    }
  }
  return result;
}
