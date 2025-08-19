import { ClearableField } from "@/components/field/types.js";

/**
 * Represents the game field.
 * 
 * This is an {@link ClearableField} implementation based on the standard JS array. \
 * No performance optimizations are applied.
 * 
 * @template TBlock - A block type. Extra information may be added if needed, for example for rendering.
 */
export class ArrayField<TBlock> implements ClearableField<TBlock> {
  private _width: number;
  private _height: number;
  private _emptyToken: TBlock;
  private _data: TBlock[][];

  constructor({ width, height, emptyToken }: {
    /** Width of the field. */
    width: number,
    /** Height of the field. Includes off-screen areas. */
    height: number,
    /** A block object that represents an empty cell. */
    emptyToken: TBlock,
  }) {
    this._width = width;
    this._height = height;
    this._emptyToken = emptyToken;
    this._data = Array.from({ length: height }, () => {
      return new Array(width).fill(emptyToken) as TBlock[];
    });
  }
  
  public get width() { return this._width; }
  public get height() { return this._height; }

  private _isInRect(x: number, y: number): boolean {
    return 0 <= x && x < this._width && 0 <= y && y < this._height;
  }

  private _assertInRect(x: number | undefined, y: number | undefined) {
    if (!this._isInRect(x ?? 0, y ?? 0)) {
      throw new RangeError(`The specified coordinate (${x ?? '-'}, ${y ?? '-'}) was out of the field.`);
    }
  }

  public get(x: number, y: number): TBlock {
    this._assertInRect(x, y);
    return this._data[y][x];
  }

  public isEmpty(x: number, y: number): boolean {
    this._assertInRect(x, y);
    return this.get(x, y) === this._emptyToken;
  }

  public set(x: number, y: number, block: TBlock) {
    this._assertInRect(x, y);
    this._data[y][x] = block;
  }

  public setEmpty(x: number, y: number) {
    this._assertInRect(x, y);
    this.set(x, y, this._emptyToken);
  }

  public clearLines(yCoords: number[]) {
    for (const y of yCoords) {
      this._assertInRect(undefined, y);
    }
    const yCoordsSorted = Array.from(yCoords).sort();
    
    // yCoordsで指定された行を除外して、それ以外を下に詰めるようにコピー
    // y: コピー先
    // y+skipped: コピー元
    let skipped = 0;
    for (let y = 0; y + skipped < this._height; y++) {

      // y+skipped (コピー元) が除外された行じゃなくなるまで skipped を増やす
      let isLineSkipped: boolean;
      do {
        const isWithinRange = skipped < yCoordsSorted.length;
        isLineSkipped = isWithinRange && y + skipped === yCoordsSorted[skipped];
        if (isLineSkipped) {
          skipped++;
        }
      }
      while (isLineSkipped);

      // 最後の行が除外されていた場合は、コピー元の参照先がないので break
      if (y + skipped >= this._height) {
        break;
      }

      if (skipped > 0) {
        for (let x = 0; x < this._width; x++) {
          this.set(x, y, this.get(x, y+skipped));
        }
      }
    }

    // 除外された行数だけ、上端の行を空白で埋める
    for (let y = this._height - skipped; y < this._height; y++) {
      for (let x = 0; x < this._width; x++) {
        this.setEmpty(x, y);
      }
    }
  }
}