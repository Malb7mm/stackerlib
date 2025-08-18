import { FieldUpdatedContext } from "@/components/event/contexts.js";
import { EventReceiver } from "@/components/event/event-bus.js";
import { EventMap } from "@/components/event/types.js";
import { ClearableField } from "@/components/field/types.js";
import { range } from "@/internal/utils/common.js";

export class LineClearMechanics<TCoord, TEventMap extends EventMap, TEventName extends keyof TEventMap> {
  private _fieldUpdatedEvent: EventReceiver<FieldUpdatedContext>;
  private _field: ClearableField<TCoord>;

  constructor (option: {
    fieldUpdatedEvent: EventReceiver<FieldUpdatedContext>,
    field: ClearableField<TCoord>,
  }) {
    this._fieldUpdatedEvent = option.fieldUpdatedEvent;
    this._field = option.field;

    this._fieldUpdatedEvent.on((ctx) => { this.execute(ctx) });
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