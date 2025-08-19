import { FieldUpdatedContext } from "@/components/event/contexts.js";
import { EventReceiver } from "@/components/event/event-bus.js";
import { ClearableField } from "@/components/field/types.js";

export class LineClearHandler {
  private _event: EventReceiver<FieldUpdatedContext>;
  private _field: ClearableField<unknown>;

  constructor ({ event, field }: {
    /** Trigger event. It accepts "field updated" ({@link FieldUpdatedContext}) event receivers. */
    event: EventReceiver<FieldUpdatedContext>,
    /** Target field. */
    field: ClearableField<unknown>,
  }) {
    this._event = event;
    this._field = field;

    this._event.on((ctx) => { this.execute(ctx) });
  }

  public execute(ctx: FieldUpdatedContext) {
    // 埋まってるかチェックする行 (Y座標) の一覧
    // Set で重複をなくしてから配列化
    let lines = Array.from(new Set(ctx.updatedBlocks.map(e => e.y)));

    // 埋まってる行を確認する
    let filledLines: number[] = [];
    for (const y of lines) {
      let isFilled = true;
      for (let x = 0; x < this._field.width; x++) {
        if (this._field.isEmpty(x, y)) {
          isFilled = false;
          break;
        }
      }

      if (isFilled) {
        filledLines.push(y);
      }
    }

    // フィールドから消す
    this._field.clearLines(filledLines);
  }
}