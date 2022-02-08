import { TemplateFunction } from "@fx/templates";

export type Input = {
  name: string;
};

const template: TemplateFunction<Input> = async ({ input }) => /*javascript*/ `
import { expect } from "chai";

describe("${input.name}", () => {
  it("exists", () => {
    expect(true).to.exist;
  });
});
`;

export default template;
