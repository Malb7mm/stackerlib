import { EventMap } from "@/components/event/types.js";

export class EventBus<TEventMap extends EventMap> {
  private listeners: { [K in keyof TEventMap]?: Array<(ctx: TEventMap[K]) => void> } = {};

  /**
   * Get an event emitter instance.
   * You can emit any events to event receivers via the instance.
   * 
   * ```
   * const emitter = gameCycle.emitter();
   * emitter.emit("event-name");
   * ```
   * 
   * @returns an event emitter
   */
  public emitter() {
    return new EventEmitter<TEventMap>(
      (event, ctx) => {
        this.listeners[event]?.forEach(h => h(ctx));
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
        (this.listeners[event] ??= []).push(handler);
      },
      (handler) => {
        const arr = this.listeners[event];
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

export class EventEmitter<TEventMap extends EventMap> {
  constructor (
    private _emit: <K extends keyof TEventMap>(event: K, ctx: TEventMap[K]) => void,
  ) {}

  /**
   * Emit the specified event with the corresponded context format.
   * 
   * ```
   * emitter.emit("event-name", { foo: "bar" });
   * ```
   * 
   * @param event Event name
   * @param ctx Context to pass to event receivers
   */
  public emit<K extends keyof TEventMap>(event: K, ctx: TEventMap[K]) {
    this._emit(event, ctx);
  }
}