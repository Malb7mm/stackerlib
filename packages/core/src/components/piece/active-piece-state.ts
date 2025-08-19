import { ActivePieceMovedContext } from "@/components/event/contexts.js";
import { EventEmitter } from "@/components/event/event-bus.js";
import { PieceShape } from "@/components/piece/piece-shape.js";
import { PieceDirection } from "@/components/piece/types.js";

export class ActivePieceState {
  private _emitter: EventEmitter<ActivePieceMovedContext>;

  constructor({ emitter }: {
    /** Event emitted when the state changes. It accepts "active-piece-moved" ({@link ActivePieceMovedContext} event emitter.) */
    emitter: EventEmitter<ActivePieceMovedContext>,
  }) {
    this._emitter = emitter;
  }

  private _emitEvent(updatedState: ActivePieceMovedContext["updatedState"]) {
    this._emitter.emit({
      updatedState,
      currentState: {
        x: this._x,
        y: this._y,
        shape: this._shape,
        direction: this._direction,
      },
    });
  }

  private _x: number = 0;
  get x() { return this._x; };

  set x(value) { 
    if (!Number.isInteger(value)) {
      throw new Error(`X-coordinate must be integer, but tried to set ${value}.`);
    }
    const updated = this._x != value;
    this._x = value;

    if (updated) {
      this._emitEvent({ x: this._x });
    }
  };

  private _y: number = 0;
  get y() { return this._y; };

  set y(value) { 
    if (!Number.isInteger(value)) {
      throw new Error(`Y-coordinate must be integer, but tried to set ${value}.`);
    }
    const updated = this._y != value;
    this._y = value;

    if (updated) {
      this._emitEvent({ y: this._y });
    }
  };

  private _shape: PieceShape<unknown> | undefined = undefined;
  get shape() { return this._shape; };
  set shape(value) { 
    const updated = this._shape != value;
    this._shape = value;

    if (updated) {
      this._emitEvent({ shape: this._shape });
    }
  };

  private _direction: PieceDirection = 0;
  get direction() { return this._direction; };
  set direction(value) { 
    const updated = this._direction != value;
    this._direction = value;

    if (updated) {
      this._emitEvent({ direction: this._direction });
    }
  };
}