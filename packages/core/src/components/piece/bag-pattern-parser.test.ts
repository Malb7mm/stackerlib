import { BagPatternParser, BagPatternTreeNode } from "@/components/piece/bag-pattern-parser.js";
import { expect, describe, test } from "vitest";

const Piece = ["T", "I", "O", "L", "J", "S", "Z"] as const;
type Piece = typeof Piece[number];
const pieces = Piece as unknown as Piece[];

describe("BagPatternParser", () => {
  test.each([
    ["[@:6](@)*2", [
      { type: "[" },
      { type: "@" },
      { type: ":" },
      { type: "NUMBER", value: 6 },
      { type: "]" },
      { type: "(" },
      { type: "@" },
      { type: ")" },
      { type: "*" },
      { type: "NUMBER", value: 2 },
    ]],
    ["TIO*100 LJSZ~", [
      { type: "PIECE", value: "T" },
      { type: "PIECE", value: "I" },
      { type: "PIECE", value: "O" },
      { type: "*" },
      { type: "NUMBER", value: 100 },
      { type: "PIECE", value: "L" },
      { type: "PIECE", value: "J" },
      { type: "PIECE", value: "S" },
      { type: "PIECE", value: "Z" },
      { type: "~" },
    ]],
    ["[(OT)(IT)]", [
      { type: "[" },
      { type: "(" },
      { type: "PIECE", value: "O" },
      { type: "PIECE", value: "T" },
      { type: ")" },
      { type: "(" },
      { type: "PIECE", value: "I" },
      { type: "PIECE", value: "T" },
      { type: ")" },
      { type: "]" },
    ]],
  ])("#%# 'tokenize' method can parse Bag-Pattern correctly", (pattern, correctTokens) => {
    const tokens = BagPatternParser.tokenize(pattern, pieces);
    expect(tokens).toEqual(correctTokens);
  });

    test("'tokenize' method throws error when the pattern contains invalid piece identifier", () => {
    expect(() => void BagPatternParser.tokenize("TIO X LJSZ", pieces)).toThrowError();
  });

  const tioljsz: BagPatternTreeNode<Piece>[] = (() => {
    const list: BagPatternTreeNode<Piece>[] = [];
    for (const piece of pieces) {
      list.push({ type: "piece", value: piece, repeat: 1 });
    }
    return list;
  })();

  test.each([
    ["[@:6](@)*2", (() => {
      const a = { type: "random-group", repeat: 1, childs: tioljsz, pickCount: 6 };
      const b = { type: "group", repeat: 2, childs: tioljsz };
      return {
        type: "root",
        childs: [a, b],
        repeatLastElement: false,
      }
    })()],
    ["TIO*100 LJSZ~", (() => {
      const nodes: BagPatternTreeNode<Piece>[]  = [];
      nodes.push({ type: "piece", value: "T", repeat: 1 });
      nodes.push({ type: "piece", value: "I", repeat: 1 });
      nodes.push({ type: "piece", value: "O", repeat: 100 });
      nodes.push({ type: "piece", value: "L", repeat: 1 });
      nodes.push({ type: "piece", value: "J", repeat: 1 });
      nodes.push({ type: "piece", value: "S", repeat: 1 });
      nodes.push({ type: "piece", value: "Z", repeat: 1 });
      return {
        type: "root",
        childs: nodes,
        repeatLastElement: true,
      }
    })()],
    ["[(OT)(IT)]", (() => {
      const aNodes: BagPatternTreeNode<Piece>[]  = [];
      aNodes.push({ type: "piece", value: "O", repeat: 1 });
      aNodes.push({ type: "piece", value: "T", repeat: 1 });
      const a = { type: "group", repeat: 1, childs: aNodes };

      const bNodes: BagPatternTreeNode<Piece>[]  = [];
      bNodes.push({ type: "piece", value: "I", repeat: 1 });
      bNodes.push({ type: "piece", value: "T", repeat: 1 });
      const b = { type: "group", repeat: 1, childs: bNodes };

      const c = { type: "random-group", repeat: 1, childs: [a, b], pickCount: 2 }
      
      return {
        type: "root",
        childs: [c],
        repeatLastElement: false,
      }
    })()],
  ])("#%# 'parse' method can build the graph correctly", (pattern, correctTree) => {
    const parser = new BagPatternParser();
    const result = parser.parse(pattern, pieces);
    expect(result).toEqual(correctTree);
  });
});