import { ASCIIVisible, Chars } from "@/internal/utils/common-types.js";

export const BagPatternSpecialSymbol = ["@", "*", ":", "~", "[", "]", "(", ")"] as const;
export type BagPatternSpecialSymbol = typeof BagPatternSpecialSymbol[number];

export type BagPatternAllowedPieceKey = Exclude<Exclude<ASCIIVisible, BagPatternSpecialSymbol>, Chars<"0123456789">>;

export type BagPatternToken<TPieceKey extends BagPatternAllowedPieceKey> =
  | { type: "NUMBER", value: number }
  | { type: "PIECE", value: TPieceKey }
  | { type: BagPatternSpecialSymbol };

export type BagPatternTokenType = BagPatternToken<any>["type"];

export type BagPatternTreeNode<TPieceKey extends BagPatternAllowedPieceKey> = { 
  type: "piece",
  repeat: number,
  value: TPieceKey,
} | { 
  type: "group"
  repeat: number,
  childs: BagPatternTreeNode<TPieceKey>[],
} | {
  type: "random-group",
  repeat: number,
  childs: BagPatternTreeNode<TPieceKey>[],
  pickCount: number,
};

export type BagPatternTreeRoot<TPieceKey extends BagPatternAllowedPieceKey> = {
  type: "root",
  repeatLastElement: boolean,
  childs: BagPatternTreeNode<TPieceKey>[],
}

export class BagPatternParser<TPieceKey extends BagPatternAllowedPieceKey> {
  private _treeNodes: BagPatternTreeNode<TPieceKey>[];
  private _tokens: BagPatternToken<TPieceKey>[];
  private _i: number;
  private _pieceKeys: TPieceKey[];

  /**
   * Parse the Bag-Pattern string and return the root node of the parse tree.
   * 
   * @param pattern Bag-Pattern string
   * @param pieceKeys List of piece identifiers
   */
  public parse(pattern: string, pieceKeys: TPieceKey[]) {
    this._tokens = BagPatternParser.tokenize(pattern, pieceKeys);
    this._i = 0;
    this._pieceKeys = pieceKeys;

    return this._pattern();
  }

  // UTILS //

  /** Get the next token. */
  private _nextToken(): BagPatternToken<TPieceKey> | null {
    const eof = this._i >= this._tokens.length;
    if (eof) return null;
    
    return this._tokens[this._i];
  }

  /** Get the value of the PREVIOUS token as a PIECE token. */
  private _getLastPieceValue(): TPieceKey {
    const next = this._tokens[this._i - 1];
    if (next.type !== "PIECE") {
      throw new Error(`Attempted getting the value from the PIECE token, but it was ${next.type}.`);
    }
    return next.value;
  }

  /** Get the value of the PREVIOUS token as a NUMBER token. */
  private _getLastNumberValue(): number {
    const next = this._tokens[this._i - 1];
    if (next.type !== "NUMBER") {
      throw new Error(`Attempted getting the value from the NUMBER token, but it was ${next.type}.`);
    }
    return next.value;
  }

  /** Checks whether the next token is of the specified type and consumes it if it matches. */
  private _accept(tokenType: BagPatternTokenType): boolean {
    const eof = this._i >= this._tokens.length;
    if (eof) return false;

    const accepted = this._nextToken().type === tokenType;
    if (accepted) this._i += 1;
    return accepted;
  }

  // [EBNF]
  // pattern      = sequence, ["~"];
  // sequence     = {element},
  // element      = (group | random group | piece) ["*" NUMBER];
  // group        = "(", sequence, ")";
  // random group = "[", sequence, [":", NUMBER], "]";
  // piece        = PIECE | "@";

  private _pattern(): BagPatternTreeRoot<TPieceKey> {
    const sequence = this._sequence();
    if (sequence === null) {
      throw new Error(`At ${this._i}: expected sequence, but the next token was ${JSON.stringify(this._nextToken())}.`);
    }

    let repeatLastElement = false;
    if (this._accept("~")) {
      repeatLastElement = true;
    }

    return {
      type: "root",
      repeatLastElement,
      childs: sequence,
    }
  }

  private _sequence(): BagPatternTreeNode<TPieceKey>[] | null {
    let nodes: BagPatternTreeNode<TPieceKey>[] = [];

    while (true) {
      const element = this._element();
      // element でないならループを抜ける
      if (element === null) {
        break;
      }

      // element は 1 要素のグループ/ランダムグループ/ピース 
      //  or n要素のピース (@) の配列なので、展開して push
      nodes.push(...element);
    }
    
    // ノード数が 0 なら null を返す
    if (nodes.length === 0) {
      return null;
    }
    return nodes;
  }

  private _element(): BagPatternTreeNode<TPieceKey>[] | null {
    let nodes: BagPatternTreeNode<TPieceKey>[] = null;

    // group
    const group = this._group();
    if (group !== null) {
      nodes = group;
    }

    // random group
    const randomGroup = this._randomGroup();
    if (randomGroup !== null) {
      nodes = randomGroup;
    }

    // piece
    const piece = this._piece();
    if (piece !== null) {
      nodes = piece;
    }

    // どれにも当てはまらないなら null (not element)
    if (nodes === null) {
      return null;
    }

    // repeat (初期値は1)
    let repeat = 1;
    if (this._accept("*")) {
      // アスタリスクの後に数が続かない: エラー
      if (!this._accept("NUMBER")) {
        throw new Error(`At ${this._i}: expected NUMBER, but the next token was ${JSON.stringify(this._nextToken())}.`);
      }
      repeat = this._getLastNumberValue();
    }
    // nodes の各ノードの repeat を更新
    for (const node of nodes) {
      node.repeat = repeat;
    }

    return nodes;
  }

  private _group(): BagPatternTreeNode<TPieceKey>[] | null {
    // ( じゃなかったら null (not グループ)
    if (!this._accept("(")) {
      return null;
    }

    // sequence が空: エラー
    const sequence = this._sequence();
    if (sequence === null) {
      throw new Error(`At ${this._i}: expected sequence, but the next token was ${JSON.stringify(this._nextToken())}.`);
    }

    // 閉じ括弧がない: エラー
    if (!this._accept(")")) {
      throw new Error(`At ${this._i}: expected ], but the next token was ${JSON.stringify(this._nextToken())}.`);
    }

    // 解析成功
    return [{ type: "group", repeat: 1, childs: sequence }];
  }

  private _randomGroup(): BagPatternTreeNode<TPieceKey>[] | null {
    // [ じゃなかったら null (not ランダムグループ)
    if (!this._accept("[")) {
      return null;
    }

    // sequence が空: エラー
    const sequence = this._sequence();
    if (sequence === null) {
      throw new Error(`At ${this._i}: expected sequence, but the next token was ${JSON.stringify(this._nextToken())}.`);
    }

    // pickCount (初期値ならsequence全部使う)
    let pickCount = sequence.length;
    if (this._accept(":")) {
      // コロンの後に数が続かない: エラー
      if (!this._accept("NUMBER")) {
        throw new Error(`At ${this._i}: expected NUMBER, but the next token was ${JSON.stringify(this._nextToken())}.`);
      }
      pickCount = this._getLastNumberValue();
    }

    // 閉じ括弧がない: エラー
    if (!this._accept("]")) {
      throw new Error(`At ${this._i}: expected ], but the next token was ${JSON.stringify(this._nextToken())}.`);
    }

    // 解析成功
    return [{ type: "random-group", pickCount, repeat: 1, childs: sequence }];
  }

  private _piece(): BagPatternTreeNode<TPieceKey>[] | null {
    // @: 全ピースセットに置き換え
    if (this._accept("@")) {
      const nodes: BagPatternTreeNode<TPieceKey>[] = [];
      for (const value of this._pieceKeys) {
        nodes.push({ type: "piece", value, repeat: 1 });
      }
      return nodes;
    }

    // PIECE: ピース単体
    if (this._accept("PIECE")) {
      return [{ type: "piece", value: this._getLastPieceValue(), repeat: 1 }];
    }

    // (not ピース)
    return null;
  }

  /** Tokenize the passed Bag-Pattern. */
  public static tokenize<TPieceKey extends BagPatternAllowedPieceKey>(pattern: string, pieceKeys: TPieceKey[]): BagPatternToken<TPieceKey>[] {
    const out: BagPatternToken<TPieceKey>[] = [];
    const evalPattern = pattern.replace(/\s/g, "");

    // 字句解析
    let i = 0;
    while (i < evalPattern.length) {
      const char = evalPattern[i];

      // 特殊記号トークン
      if ((BagPatternSpecialSymbol as readonly string[]).includes(char)) {
        out.push({ type: char as BagPatternSpecialSymbol });
        i += 1;
        continue;
      }
      // NUMBER: 整数トークン
      {
        const regex = /[0-9]+/y;
        regex.lastIndex = i;
        const result = regex.exec(evalPattern);

        if (result) {
          const value = parseInt(result[0], 10);
          out.push({ type: "NUMBER", value });
          i += result[0].length;
          continue;
        }
      }
      // PIECE: ピース識別子トークン
      if ((pieceKeys as string[]).includes(char)) {
        out.push({ type: "PIECE", value: char as TPieceKey });
        i += 1;
        continue;
      }

      throw new SyntaxError(`Bag-Pattern parsing failed at index ${i} (${char}).`);
    }

    return out;
  }
}