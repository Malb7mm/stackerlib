
import { ArrayField } from "@/components/field/array-field.js";
import { expect, describe, test, vi } from "vitest";

type Block = "a" | "b" | "empty";

describe("ArrayField2D", () => {
  test.each([
    [10, 40],
    [1, 40],
    [10, 1],
    [1, 1],
  ])("#%# The field should be created with specified size", (width, height) => {
    const field = new ArrayField<Block>({ width, height, emptyToken: "empty" });
    expect(field.width).toBe(width);
    expect(field.height).toBe(height);
    expect(() => void field.get(0, 0)).not.toThrowError();
    expect(() => void field.get(-1, 0)).toThrowError();
    expect(() => void field.get(0, -1)).toThrowError();
    expect(() => void field.get(width - 1, height - 1)).not.toThrowError();
    expect(() => void field.get(width, height - 1)).toThrowError();
    expect(() => void field.get(width - 1, height)).toThrowError();
  });
  
  test.each([
    [10, 40],
    [1, 40],
    [10, 1],
    [1, 1],
  ])("#%# The field should be initialized with the empty block", (width, height) => {
    const field = new ArrayField<Block>({ width, height, emptyToken: "empty" });
    for (let x = 0; x < field.width; x++) {
      for (let y = 0; y < field.height; y++) {
        expect(field.isEmpty(x, y)).toBe(true);
      }
    }
  });

  test.each([
    [ [[1, 2, "a"], [2, 1, "b"], [8, 9, "a"], [9, 8, "b"]] ],
    [ [[3, 4, "a"], [5, 6, "a"]] ],
    [ [[4, 5, "b"], [6, 7, "b"]] ],
    [ [[0, 0, "a"], [0, 0, "b"], [0, 0, "empty"]] ],
  ])("#%# The blocks set should be able to get", (blocks: [number, number, Block][]) => {
    const field = new ArrayField<Block>({ width: 10, height: 10, emptyToken: "empty" });
    for (const block of blocks) {
      field.set(...block);
      expect(field.get(block[0], block[1])).toBe(block[2]);
    }
  });

  test("The blocks in the field should be able to clear with 'setEmpty' method", () => {
    const field = new ArrayField<Block>({ width: 10, height: 10, emptyToken: "empty" });
    for (let x = 0; x < field.width; x++) {
      for (let y = 0; y < field.height; y++) {
        field.set(x, y, "a");
      }
    }
    for (let x = 0; x < field.width; x++) {
      for (let y = 0; y < field.height; y++) {
        field.setEmpty(x, y);
      }
    }
    for (let x = 0; x < field.width; x++) {
      for (let y = 0; y < field.height; y++) {
        expect(field.isEmpty(x, y)).toBe(true);
      }
    }
  });

  test("It can clear specified rows as if it's Tetris", () => {
    const field = new ArrayField<Block>({ width: 10, height: 10, emptyToken: "empty" });
    for (let x = 0; x < field.width; x++) {
      for (let y = 0; y < 5; y++) { // 五段積む
        field.set(x, y, y % 2 === 0 ? "a" : "b"); // 奇数段はa、偶数段はb
      }
    }
    field.clearLines([0, 2, 4]); // 奇数段を消す

    for (let x = 0; x < field.width; x++) {
      for (let y = 0; y < 2; y++) {
        expect(field.get(x, y)).toBe("b"); // 奇数段を消したのでどちらもbのはず
      }
    }
    for (let x = 0; x < field.width; x++) {
      for (let y = 2; y < field.height; y++) {
        expect(field.get(x, y)).toBe("empty"); // それより上は全部空白
      }
    }
  });
});