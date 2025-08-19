import { PieceShape } from "@/components/piece/piece-shape.js";
import { PieceDirection } from "@/components/piece/types.js";

export type FieldUpdatedContext = {
  updatedBlocks: Array<{ x: number, y: number }>,
};

export type ActivePieceMovedContext = {
  x: number,
  y: number,
  shape: PieceShape<unknown>,
  direction: PieceDirection,
}