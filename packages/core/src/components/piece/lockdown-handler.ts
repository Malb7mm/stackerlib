import { ActivePieceMovedContext, EmptyEventContext, PieceSpawnedContext } from "@/components/event/contexts.js";
import { EventEmitter, EventReceiver } from "@/components/event/event-bus.js";
import { PieceDirection } from "@/components/piece/types.js";
import { TimeStamp } from "@/internal/utils/common-types.js";

export class LockdownHandler {
  // _assertsField 用に protected
  protected _timerStartedAt?: TimeStamp;
  protected _lowestY?: number;

  private _timerResetUsed: number = 0;
  private readonly _timerResetMax: number;
  private readonly _lockdownTimerDuration: number;
  
  private readonly _lockdownEmitter: EventEmitter<EmptyEventContext>;

  constructor({ lockdownTimerDuration = 500, maxTimerResetCount = 15, moveEvent, gameLoopEvent, pieceSpawnedEvent, lockdownEmitter }: {
    /** Grace period before lockdown, in milliseconds. @default 500 */
    lockdownTimerDuration: number,
    /** Maximum number of times the lockdown timer can be reset. The count resets whenever the lowest Y-coordinate is updated. @default 15 */
    maxTimerResetCount: number,

    /** Event receiver for the movement of the active piece. Accepts a receiver with {@link ActivePieceMovedContext}. */
    moveEvent: EventReceiver<ActivePieceMovedContext>,
    /** Event receiver for the game loop. No event context required. */
    gameLoopEvent: EventReceiver<EmptyEventContext>,
    /** Event receiver for spawning piece. Accepts a receiver with {@link PieceSpawnedContext}. */
    pieceSpawnedEvent: EventReceiver<PieceSpawnedContext>,
    /** Event emitter triggered during lockdown, once per game loop. No event context provided. */
    lockdownEmitter: EventEmitter<EmptyEventContext>,
  }) {
    this._timerResetMax = maxTimerResetCount;
    this._lockdownTimerDuration = lockdownTimerDuration;
    this._lockdownEmitter = lockdownEmitter;
    moveEvent.on((ctx) => this._onMove(ctx));
    pieceSpawnedEvent.on((ctx) => this._onPieceSpawned(ctx));
    gameLoopEvent.on(() => this._onGameLoop());
  }

  private _assertFields(): asserts this is this & {
    _timerStartedAt: TimeStamp,
    _lowestY: number,
  } {
    if (this._timerStartedAt === undefined) {
      throw new Error("_timerStartedAt is undefined.");
    }
    if (this._lowestY === undefined) {
      throw new Error("_lowestY is undefined.");
    }
  }

  private _tryResetTimer() {
    if (this._timerResetUsed >= this._timerResetMax) {
      return;
    }
    this._timerStartedAt = Date.now();
    this._timerResetUsed++;
  }

  private _onPieceSpawned(ctx: PieceSpawnedContext) {
    const blocks = ctx.piece.shape.getBlocks(ctx.piece.spawnOffset.x, ctx.piece.spawnOffset.y, PieceDirection.Natural);
    this._lowestY = Math.min(...blocks.map(e => e.y));
    this._tryResetTimer();
  }

  private _onMove(ctx: ActivePieceMovedContext) {
    this._assertFields();

    const lowestYMayUpdated = ctx.updatedState.y !== undefined || ctx.updatedState.direction !== undefined;
    if (lowestYMayUpdated) {
      const blocks = ctx.currentState.shape.getBlocks(ctx.currentState.x, ctx.currentState.y, ctx.currentState.direction);
      const newLowestY = Math.min(...blocks.map(e => e.y));

      const updated = newLowestY < this._lowestY;
      if (updated) {
        this._lowestY = newLowestY;
        this._tryResetTimer();
      }
    }
  }

  private _onGameLoop() {
    this._assertFields();

    const now = Date.now();
    if (Math.abs(now - this._timerStartedAt) > this._lockdownTimerDuration) {
      this._lockdownEmitter.emit({});
    }
  }
}