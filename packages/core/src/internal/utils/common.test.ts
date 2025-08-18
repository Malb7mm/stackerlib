import { range } from "@/internal/utils/common.js";
import { it, expect, describe } from "vitest";

describe("Common utils", () => {
  describe("range", () => {
    it("works", () => {
      expect(range(0, 2)).toEqual([0, 1]);
    });
  })
});