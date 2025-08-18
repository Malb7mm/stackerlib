import { LineClearMechanics } from "@/components/field/line-clear.js";
import { EventBus } from "@/components/event/event-bus.js";
import { ArrayField } from "@/components/field/array-field.js";
import { BPPieceBag } from "@/components/piece/bp-piece-bag.js";
import { PieceShape } from "@/components/piece/piece-shape.js";
import { FieldUpdatedContext } from "@/components/event/contexts.js";

type Block = "T" | "O" | "I" | "J" | "L" | "S" | "Z" | undefined;
type Events = {
  "field-updated": FieldUpdatedContext,
}

export const pieceShapes = {
  "T": {
    shape: new PieceShape<Block>({
      blocks: [
        { x: 0, y: 0, block: "T" },
        { x: 1, y: 0, block: "T" },
        { x: 2, y: 0, block: "T" },
        { x: 1, y: 1, block: "T" },
      ],
      rotationPivot: { x: 1, y: 0 },
    }),
    spawnOffset: { x: 3, y: 20 },
  },
  "I": {
    shape: new PieceShape<Block>({
      blocks: [
        { x: 0, y: 0, block: "I" },
        { x: 1, y: 0, block: "I" },
        { x: 2, y: 0, block: "I" },
        { x: 3, y: 0, block: "I" },
      ],
      rotationPivot: { x: 1.5, y: -0.5 },
    }),
    spawnOffset: { x: 3, y: 20 },
  },
  "O": {
    shape: new PieceShape<Block>({
      blocks: [
        { x: 0, y: 0, block: "O" },
        { x: 1, y: 0, block: "O" },
        { x: 0, y: 1, block: "O" },
        { x: 1, y: 1, block: "O" },
      ],
      rotationPivot: { x: 0.5, y: 0.5 },
    }),
    spawnOffset: { x: 4, y: 20 },
  },
  "L": {
    shape: new PieceShape<Block>({
      blocks: [
        { x: 0, y: 0, block: "L" },
        { x: 1, y: 0, block: "L" },
        { x: 2, y: 0, block: "L" },
        { x: 2, y: 1, block: "L" },
      ],
      rotationPivot: { x: 1, y: 0 },
    }),
    spawnOffset: { x: 3, y: 20 },
  },
  "J": {
    shape: new PieceShape<Block>({
      blocks: [
        { x: 0, y: 0, block: "J" },
        { x: 1, y: 0, block: "J" },
        { x: 2, y: 0, block: "J" },
        { x: 0, y: 1, block: "J" },
      ],
      rotationPivot: { x: 1, y: 0 },
    }),
    spawnOffset: { x: 3, y: 20 },
  },
  "S": {
    shape: new PieceShape<Block>({
      blocks: [
        { x: 0, y: 0, block: "S" },
        { x: 1, y: 0, block: "S" },
        { x: 1, y: 1, block: "S" },
        { x: 2, y: 1, block: "S" },
      ],
      rotationPivot: { x: 1, y: 0 },
    }),
    spawnOffset: { x: 3, y: 20 },
  },
  "Z": {
    shape: new PieceShape<Block>({
      blocks: [
        { x: 2, y: 0, block: "Z" },
        { x: 1, y: 0, block: "Z" },
        { x: 1, y: 1, block: "Z" },
        { x: 0, y: 1, block: "Z" },
      ],
      rotationPivot: { x: 1, y: 0 },
    }),
    spawnOffset: { x: 3, y: 20 },
  },
}

export const build = () => {
  const eventBus = new EventBus<Events>();

  const field = new ArrayField<Block>(10, 40, undefined);
  const pieceBag = new BPPieceBag<Block, Block>(pieceShapes, "[@]~");

  const lineClear = new LineClearMechanics({
    fieldUpdatedEvent: eventBus.event("field-updated"), 
    field,
  });
}