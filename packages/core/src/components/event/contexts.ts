import { PieceShape } from "@/components/piece/piece-shape.js";
import { PieceDirection } from "@/components/piece/types.js";

export type FieldUpdatedContext = {
  updatedBlocks: Array<{ x: number, y: number }>,
};

type PieceState = {
  x: number,
  y: number,
  shape: PieceShape<unknown> | undefined,
  direction: PieceDirection,
}

export type ActivePieceMovedContext = {
  updatedState: Partial<PieceState>,
  currentState: PieceState,
}