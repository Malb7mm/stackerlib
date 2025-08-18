import { PieceDirection } from "@/components/piece/types.js";

/**
 * Defines the shape of a piece as an object.
 * 
 * Coordinates are written as decimals. \
 * When both x and y are integers (like (0, 0)), the point is at the grid center.
 * 
 * The rotation pivot can be either at the grid center or on a lattice point. \
 * For example, if the pivot is at (0.5, 0.5), the block at (0, 0) will move to (1, 0)
 * after a clockwise rotation.
 */
export type PieceShapeRepresenter<TBlock> = {
  /** 
   * Blocks that make up the piece shape. \
   * Their coordinates must be at the grid centers like (0, 0).
   */
  blocks: Array<{
    x: number,
    y: number,
    block: TBlock,
  }>,
  /** 
   * Rotation pivot, either on lattice points or at the grid center. \
   * It must be at the grid centers like (0, 0) or on lattice points like (0.5, 0.5).
   */
  rotationPivot: {
    x: number,
    y: number,
  },
  /** 
   * Origin of the shape. Blocks are placed relative to it. Default is `"zero"` (0, 0). \
   * It must be at the grid centers like (0, 0).
  */
  origin?: "zero" | {
    x: number,
    y: number,
  },
};

const assertShape = <TBlock>(shape: PieceShapeRepresenter<TBlock>) => {
  // blocks
  for (const [i, block] of shape.blocks.entries()) {
    const { x, y } = block;

    const gridCenter = Number.isInteger(x) && Number.isInteger(y);

    if (!gridCenter) {
      throw new Error(
        `Invalid coordinate of blocks[${i}]: (${x}, ${y}). It must be at the grid centers like (0, 0).`
      );
    }
  }

  // rotationPivot
  {
    const { x, y } = shape.rotationPivot;

    const latticePoint = Number.isInteger(x-0.5) && Number.isInteger(y-0.5);
    const gridCenter = Number.isInteger(x) && Number.isInteger(y);

    if (!latticePoint && !gridCenter) {
      throw new Error(
        `Invalid rotationPivot: (${x}, ${y}). It must be at the grid centers like (0, 0) or on lattice points like (0.5, 0.5).`
      );
    }
  }

  // origin
  if (typeof shape.origin === "object") {
    const { x, y } = shape.origin;

    const gridCenter = Number.isInteger(x) && Number.isInteger(y);

    if (!gridCenter) {
      throw new Error(
        `Invalid origin: (${x}, ${y}). It must be at the grid centers like (0, 0).`
      );
    }
  }
}

/**
 * Represents the shape of the piece.
 */
export class PieceShape<TBlock> {
  private _shapes: Record<PieceDirection, Array<{
    x: number,
    y: number,
    block: TBlock,
  }>> = { 0: [], 1: [], 2: [], 3: [] };

  /**
   * @param shape - {@link PieceShapeRepresenter}
   */
  constructor (shape: PieceShapeRepresenter<TBlock>) {
    assertShape(shape);

    // origin の値を取り出す (or "zero"かundefinedなら(0, 0))
    const origin = { x: 0, y: 0 };
    if (typeof shape.origin === "object") {
      Object.assign(origin, shape.origin);
    }

    // origin の値だけ blocks の座標をずらす
    let blocks = Array.from(shape.blocks)
      .map((b) => ({ 
        x: b.x - origin.x, 
        y: b.y - origin.y, 
        block: b.block 
      }));

    // 90度ずつ回しながら _shapes に保存
    const pivot = shape.rotationPivot;
    for (let i of Object.values(PieceDirection)) {
      this._shapes[i] = Array.from(blocks);
      
      blocks = blocks.map((b) => ({ 
        x: pivot.x + (b.y - pivot.y),
        y: pivot.y + (b.x - pivot.x),
        block: b.block 
      }));
    }
  }

  /**
   * Get blocks of shape in the specified direction.
   * 
   * @param direction 
   * @returns 
   */
  public getBlocks(direction: PieceDirection) {
    return this._shapes[direction];
  }
}