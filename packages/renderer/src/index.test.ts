import { it, expect } from "vitest";
import { TEMPCONST } from "@stackerlib/core";

it("should be testable", () => {
  expect(TEMPCONST).toBe("core");
});