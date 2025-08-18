const { shuffleMock } = vi.hoisted(() => ({ shuffleMock: vi.fn() }));
vi.mock("@/internal/utils/common.js", async (importOriginal) => {
  const mod = await importOriginal<typeof import("@/internal/utils/common.js")>();
  return { ...mod, shuffle: shuffleMock };
});

import { BPPieceBag } from "@/components/piece/bp-piece-bag.js";
import { PieceShape } from "@/components/piece/piece-shape.js";
import { PieceDefinition } from "@/components/piece/types.js";
import { expect, describe, test, vi } from "vitest";

const Piece = ["T", "I", "O", "L", "J", "S", "Z"] as const;
type Piece = typeof Piece[number];
const pieces = Piece as unknown as Piece[];

const dummyPiece = (s) => { return {
  shape: new PieceShape({ blocks: [{ x: 0, y: 0, block: "T" }], rotationPivot: {x: 0, y: 0} }),
  spawnOffset: {x: 0, y: 0},
  key: s,
} as PieceDefinition<Piece> };
const dummyPieces = {
  "T": dummyPiece("T"),
  "I": dummyPiece("I"),
  "O": dummyPiece("O"),
  "L": dummyPiece("L"),
  "J": dummyPiece("J"),
  "S": dummyPiece("S"),
  "Z": dummyPiece("Z"),
}

describe("BPPieceBag", () => {
  const each: ([string, number[], string][]) = [
    [ 
      "@", 
      [6, 5, 4, 3, 2, 1, 0], 
      "TIOLJSZ"
    ],
    [ 
      "(TIO)*2LJ*2", 
      [6, 5, 4, 3, 2, 1, 0], 
      "TIOTIOLJJ"
    ],
    [ 
      "[@]", 
      [6, 5, 4, 3, 2, 1, 0], 
      "ZSJLOIT"
    ],
    [ 
      "[@:3]*2[@]", 
      [6, 5, 4, 3, 2, 1, 0], 
      "ZSJZSJZSJLOIT"
    ],
    [ 
      "[@]~", 
      [6, 5, 4, 3, 2, 1, 0], 
      "ZSJLOITZSJLOIT"
    ],
    [ 
      "[(OT)(IT)]", 
      [1, 0], 
      "ITOT"
    ],
    [ 
      "[[OTS][ITS][JTS]:2]", 
      [2, 0, 1], 
      "SJTSOT"
    ],
  ];

  test.each(each)("#%# (via 'getNexts') It interpret Bag-Pattern correctly and serve correct next pieces", (pattern, shuffleOrder, correctNexts) => {
    shuffleMock.mockImplementation(<T>(array: T[]): T[] => {
      const result = [];
      for (let i = 0; i < array.length; i++) {
        result.push(array[shuffleOrder[i]]);
      };
      return result;
    });

    const pieceBag = new BPPieceBag(dummyPieces, pattern);
    const nexts = pieceBag.getNexts(correctNexts.length).map((e: any) => e.key);
    expect(nexts).toEqual(correctNexts.split(""));
  });

  test.each(each)("#%# (via 'pick') It interpret Bag-Pattern correctly and serve correct next pieces", (pattern, shuffleOrder, correctNexts) => {
    shuffleMock.mockImplementation(<T>(array: T[]): T[] => {
      const result = [];
      for (let i = 0; i < array.length; i++) {
        result.push(array[shuffleOrder[i]]);
      };
      return result;
    });

    const pieceBag = new BPPieceBag(dummyPieces, pattern);
    for (const next of correctNexts) {
      expect((pieceBag.pick() as any).key).toEqual(next);
    }
  });
});