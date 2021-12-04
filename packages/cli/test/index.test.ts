import { z } from "zod";
import { expect } from "chai";

describe("fx", () => {
  it("inquires", () => {
    const shape = z.string();
    expect(shape).to.exist;
  });
})