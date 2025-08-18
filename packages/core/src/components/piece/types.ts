import { PieceShape } from "@/components/piece/piece-shape.js";

export type PieceBag<TBlock> = {
  pieces: Record<string, PieceDefinition<TBlock>>;
  pieceKeys: string[];
  pick(): PieceDefinition<TBlock>;
  getNexts(count: number): PieceDefinition<TBlock>[];
}

export type PieceDefinition<TBlock> = {
  shape: PieceShape<TBlock>,
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