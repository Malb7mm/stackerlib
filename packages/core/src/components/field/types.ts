export type Field<Block> = {
  get width(): number;
  get height(): number;
  get(x: number, y: number): Block;
  isEmpty(x: number, y: number): boolean;
  set(x: number, y: number, block: Block);
  setEmpty(x: number, y: number);
}

export type ClearableField<Block> = 
  Field<Block> & {
    clearLines(yCoords: number[]): void;
  }