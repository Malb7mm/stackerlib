import { PieceShape } from "@/components/piece/piece-shape.js";
import { PieceDirection } from "@/components/piece/types.js";

export class ActivePiece<TPieceKey> {
  private _x: number = 0;
  get x() { return this._x; };

  set x(value) { 
    if (!Number.isInteger(value)) {
      throw new Error(`X-coordinate must be integer, but tried to set ${value}.`);
    }
    this._x = value;
  };

  private _y: number = 0;
  get y() { return this._y; };

  set y(value) { 
    if (!Number.isInteger(value)) {
      throw new Error(`Y-coordinate must be integer, but tried to set ${value}.`);
    }
    this._y = value;
  };

  private _shape: PieceShape<TPieceKey> = undefined;
  get shape() { return this._shape; };
  set shape(value) { this._shape = value; };

  private _direction: PieceDirection = 0;
  get direction() { return this._direction; };
  set direction(value) { this._direction = value; };
}