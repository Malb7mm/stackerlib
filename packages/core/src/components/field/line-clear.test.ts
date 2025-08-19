import { LineClearHandler } from "@/components/field/line-clear.js";
import { EventReceiver } from "@/components/event/event-bus.js";
import { expect, describe, test, vi } from "vitest";
import { ClearableField } from "@/components/field/types.js";
import { FieldUpdatedContext } from "@/components/event/contexts.js";

describe("LineClearBehavior", () => {
  const trigger = {
    on: vi.fn(),
  } as unknown as EventReceiver<FieldUpdatedContext>;

  const isEmpty = vi.fn();
  const clearLines = vi.fn();
  const field = {
    width: 10,
    height: 40,
    isEmpty,
    clearLines,
  } as unknown as ClearableField<unknown>;

  test("Filled lines should be cleared", () => {
    // フィールドの疑似作成（空白判定だけ）
    // y=0, 1: 埋まってる
    // y>2: 空白
    isEmpty.mockImplementation((x, y) => {
      return y > 1;
    });

    const lineClear = new LineClearHandler({ event: trigger, field });

    lineClear.execute({
      updatedBlocks: [
        { x: 0, y: 0, },
        { x: 0, y: 1, },
      ]
    });
    
    expect(clearLines).toHaveBeenCalledWith([0, 1]);
  });

  test("Lacked lines shouldn't be cleared", () => {
    // フィールドの疑似作成（空白判定だけ）
    // y=0, 1: 10列目以外埋まってる
    // y>2: 空白
    isEmpty.mockImplementation((x, y) => {
      return y > 1 || x != 9;
    });

    const lineClear = new LineClearHandler({ event: trigger, field });

    lineClear.execute({
      updatedBlocks: [
        { x: 0, y: 0, },
        { x: 0, y: 1, },
      ]
    });
    
    expect(clearLines).toHaveBeenCalledWith([]);
  });
});