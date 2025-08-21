import { PieceShape } from "@/components/piece/piece-shape.js";
import { PieceDirection } from "@/components/piece/types.js";

export type FieldUpdatedContext = {
  updatedBlocks: Array<{ x: number, y: number }>,
};

type PieceState = {
  x: number,
  y: number,
  shape: PieceShape<unknown>,
  direction: PieceDirection,
}

export type ActivePieceMovedContext = {
  updatedState: Partial<PieceState>,
  currentState: PieceState,
}

export type EmptyEventContext = { [K in PropertyKey]?: never } & object;