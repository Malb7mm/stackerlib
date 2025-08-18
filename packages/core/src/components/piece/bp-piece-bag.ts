import { range, shuffle } from "@/internal/utils/common.js";
import { BagPatternAllowedPieceKey, BagPatternParser, BagPatternTreeNode, BagPatternTreeRoot } from "@/components/piece/bag-pattern-parser.js";
import { PieceBag, PieceDefinition } from "@/components/piece/types.js";

const assertPieces = <TBlock>(piecesMap: Record<string, PieceDefinition<TBlock>>) => {
  for (const [key, piece] of Object.entries(piecesMap)) {
    const { x, y } = piece.spawnOffset;

    const isInteger = Number.isInteger(x) && Number.isInteger(y);

    if (!isInteger) {
      throw new Error(
        `Invalid spawnOffset of pieces[${key}]: (${x}, ${y}). Both must be integers.`
      );
    }
  }
}

type DFSStackElement<TPieceKey> = { 
  node: BagPatternTreeRoot<TPieceKey> | BagPatternTreeNode<TPieceKey>, 
  order: number[],
  current: number,
  repeatCount: number,
};
type DFSStack<TPieceKey> = Array<DFSStackElement<TPieceKey>>;

export class BPPieceBag<TPieceKey extends BagPatternAllowedPieceKey, TBlock> implements PieceBag<TBlock> {
  private _repeat: boolean;
  
  private _nextQueue: PieceDefinition<TBlock>[] = [];
  private _dfsStack: DFSStack<TPieceKey> = [];
  
  public readonly pieceKeys: TPieceKey[];

  constructor(
    public readonly pieces: Record<TPieceKey, PieceDefinition<TBlock>>,
    pattern: string,
  ) {
    assertPieces(pieces);
    this.pieceKeys = Object.keys(pieces) as TPieceKey[];

    const parser = new BagPatternParser<TPieceKey>();
    const root = parser.parse(pattern, this.pieceKeys);
    this._repeat = root.repeatLastElement;

    // スタックに root ノードを積む
    this._pushToStack(root);

    // piece ノードに当たるまで childs[0] を辿る
    while (true) {
      const head = this._dfsStack.at(-1);
      if (head.node.type === "piece") {
        break;
      }

      this._pushHeadToStack();
    }
  }

  public pick() {
    this._refillNexts(1);
    return this._nextQueue.pop();
  }

  public getNexts(count: number): PieceDefinition<TBlock>[] {
    this._refillNexts(count);
    return this._nextQueue.slice(0, count);
  }

  private _refillNexts(upTo: number) {
    while (this._nextQueue.length < upTo) {
      const pieceKey = this._getNextPieceKey();
      // もうネクストが残ってなかったらそこで中断
      if (pieceKey === undefined) {
        return;
      }

      const piece = this.pieces[pieceKey];
      this._nextQueue.push(piece);
    }
  }

  private _getNextPieceKey() {
    if (this._dfsStack.length === 0) {
      return undefined;
    }

    const head = this._dfsStack.at(-1);
    if (head.node.type !== "piece") {
      throw new Error("The head node of the stack is not 'piece' node.");
    }

    const result = head.node.value;
    this._stepDfs();
    return result;
  }

  private _stepDfs() {
    // 現在の piece ノード
    {
      const head = this._dfsStack.at(-1);
      if (head.node.type !== "piece") {
        throw new Error("The head node of the stack is not 'piece' node.");
      }

      // repeat 回数が残っているなら、repeatCount をインクリメントしてスタックは動かさず return
      if (head.repeatCount + 1 < head.node.repeat) {
        head.repeatCount += 1;
        return true;
      }

      // repeat 回数が残っていないなら、スタックから pop して進む
      this._dfsStack.pop();
    }

    // DFS スタックを使い切っている場合 (= not repeatLastElement かつネクスト全消費済み)
    //  は return undefined;
    if (this._dfsStack.length === 0) {
      return false;
    }

    while (true) {
      const head = this._dfsStack.at(-1);
      if (head.node.type === "piece") throw new Error("Unreachable"); // piece ノードから遡った後なので head は必ずグループ

      // まだグループの中に要素が残っているなら、これ以上遡らなくてよい
      // ただし、random group で pickCount を使い切っている場合は遡るので、break (= グループ内の次の要素を pick) しない
      const ranOutPickCount = head.node.type === "random-group" && head.current + 1 >= head.node.pickCount;
      if (head.current + 1 < head.node.childs.length && !ranOutPickCount) {
        break;
      }
      // repeat 回数がまだ残っているなら、repeatCount をインクリメントして current を -1 に戻す
      else if (head.node.type !== "root" && head.repeatCount + 1 < head.node.repeat) {
        head.repeatCount += 1;
        head.current = -1; // ループ抜けた後に 1 進めるので -1
        break;
      }
      // ルートノードの最後の要素まで使い切った場合
      else if (head.node.type === "root") {
        // repeatLastElement なら current を一つ戻す（無限ループ）
        if (this._repeat) {
          head.current -= 1;
          break;
        }
        // not repeatLastElement なら false を返して終了
        else {
          return false;
        }
      }

      // グループの中の要素を使いきっているので、スタックを pop して親ノードへ遡る
      this._dfsStack.pop();
    }

    // この時点で「head がグループであり、head 内に次の要素が残っている」ことが保証される
    this._dfsStack.at(-1).current += 1;

    // piece ノードに当たるまで childs[current] を辿る
    while (true) {
      const head = this._dfsStack.at(-1);
      if (head.node.type === "piece") {
        // piece ノードに当たったら (次の piece ノードがスタックの head になったら) 終了
        return true;
      }

      this._pushHeadToStack();
    }
  }

  private _pushHeadToStack() {
    const head = this._dfsStack.at(-1);
    if (head.node.type === "piece") {
      throw new Error("The head node of the stack is 'piece' node already.");
    }
    this._pushToStack(head.node.childs[head.order[head.current]]);
  }

  private _pushToStack(node: BagPatternTreeRoot<TPieceKey> | BagPatternTreeNode<TPieceKey>) {
    if (node.type === "piece") {
      this._dfsStack.push({
        node,
        current: 0,
        repeatCount: 0,
        order: [],
      });
    }
    if (node.type === "group" || node.type === "root") {
      this._dfsStack.push({
        node,
        current: 0,
        repeatCount: 0,
        order: range(0, node.childs.length),
      });
    }
    if (node.type === "random-group") {
      this._dfsStack.push({
        node,
        current: 0,
        repeatCount: 0,
        order: shuffle(range(0, node.childs.length)),
      });
    }
  }
}