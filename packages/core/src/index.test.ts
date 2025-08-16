import { it, expect } from "vitest";
import { TEMPCONST } from "./index.js";

it("should be testable", () => {
  expect(TEMPCONST).toBe("core");
});