import { TemplateFunction } from "@fx/templates";

const template: TemplateFunction<{ name: string }> = async ({ input }) => {
  return /*javascript*/ `// package ${input?.name}
`;
};

export default template;
