import { EventMap } from "@/components/event/types.js";

export class EventBus<TEventMap extends EventMap> {
  private _callbacks: { [K in keyof TEventMap]?: Array<(ctx: TEventMap[K]) => void> } = {};

  /**
   * Get an event emitter instance corresponded to specified event name.
   * 
   * ```
   * const emitter = gameCycle.emitter("event-name");
   * emitter.emit({ foo: "bar" });
   * ```
   * 
   * @param event Event name
   * @returns an event emitter
   */
  public emitter<K extends keyof TEventMap>(event: K): EventEmitter<TEventMap[K]> {
    return new EventEmitter<TEventMap[K]>(
      (ctx) => {
        if (this._callbacks[event] === undefined) {
          return;
        }
        for (const callback of this._callbacks[event]) {
          callback(ctx);
        }
      }
    );
  }

  /**
   * Get an event receiver instance corresponded to specified event name.
   * 
   * ```
   * const event = gameCycle.event("event-name");
   * event.on((ctx) => {
   *   console.log(ctx.foo);
   * });
   * ```
   * 
   * @param event Event name
   * @returns an event receiver
   */
  public event<K extends keyof TEventMap>(event: K): EventReceiver<TEventMap[K]> {
    return new EventReceiver<TEventMap[K]>(
      (handler) => {
        (this._callbacks[event] ??= []).push(handler);
      },
      (handler) => {
        const arr = this._callbacks[event];
        if (!arr) return;
        const i = arr.indexOf(handler);
        if (i >= 0) arr.splice(i, 1);
      }
    );
  }
}

export class EventReceiver<TContext extends object> {
  constructor (
    private _add: (handler: (ctx: TContext) => void) => void,
    private _remove: (handler: (ctx: TContext) => void) => void,
  ) {}

  /**
   * Register the specified handler to the event.
   * 
   * @param handler Event handler function
   * @returns this (for method chaining)
   */
  public on(handler: (ctx: TContext) => void) {
    this._add(handler);
    return this;
  }

  /**
   * Unregister the specified handler from the event.
   * 
   * @param handler Event handler function
   * @returns this (for method chaining)
   */
  public off(handler: (ctx: TContext) => void) {
    this._remove(handler);
    return this;
  }
}

export class EventEmitter<TContext extends object> {
  constructor (
    private _emit: (ctx: TContext) => void,
  ) {}

  /**
   * Emit the event with the corresponded context format.
   * 
   * @param ctx Context to pass to event receivers
   */
  public emit(ctx: TContext) {
    this._emit(ctx);
  }
}