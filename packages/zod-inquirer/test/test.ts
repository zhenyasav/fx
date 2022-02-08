import { z } from "zod";
import { expect } from "chai";
import { inquire, getQuestions } from "../src";

describe('zod-inquirer', () => {
  it("exists", () => {
    expect(inquire).to.exist;
  });

  it("can parse a simple shape", () => {
    const shape = z.object({
      foo: z.string().describe('foo')
    });

    const questions = getQuestions(shape.shape);

    expect(questions).to.exist.and.be.an('array').of.length(1);
    
  });
})