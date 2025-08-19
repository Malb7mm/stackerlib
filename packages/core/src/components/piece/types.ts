import { PieceShape } from "@/components/piece/piece-shape.js";

export type PieceBag = {
  pieces: Record<string, PieceDefinition>;
  pieceKeys: string[];
  pick(): PieceDefinition;
  getNexts(count: number): PieceDefinition[];
}

export type PieceDefinition = {
  shape: PieceShape<unknown>,
  spawnOffset: {
    x: number,
    y: number,
  }
}

export const PieceDirection = {
  Natural: 0,
  Clockwise: 1,
  UpsideDown: 2,
  CounterClockwise: 3,
} as const;

export type PieceDirection = (typeof PieceDirection)[keyof typeof PieceDirection]