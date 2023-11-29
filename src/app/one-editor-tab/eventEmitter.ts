import { Handler } from './dataTypes';

export class EventEmitter<BreakpointEvents extends Record<string, any>> {
    private eventsMap: Map<keyof BreakpointEvents, Set<Handler>> = new Map();

    /**
     * @description subscribe event with handler
     * @param event event name
     * @param handler event handler
     */
    on<K extends keyof BreakpointEvents>(event: K, handler: Handler<BreakpointEvents[K]>) {
        let handlers = this.eventsMap.get(event);

        if (!handlers) {
            handlers = new Set();
            this.eventsMap.set(event, handlers);
        }

        handlers.add(handler);
    }

    /**
     * @description subscribe event with handler handler one times
     * @param event event name
     * @param handler event handler
     */
    once<K extends keyof BreakpointEvents>(event: K, handler: Handler<BreakpointEvents[K]>) {
        const that = this;

        function _once(args: BreakpointEvents[K]) {
            handler(args);
            that.off(event, _once);
        }

        this.on(event, _once);
    }

    /**
     * @description handler would be excute when emit
     * @param event event name
     * @param args event handler arguments
     */
    emit<K extends keyof BreakpointEvents>(event: K, args: BreakpointEvents[K]) {
        const handlers = this.eventsMap.get(event);

        if (handlers) {
            for (let handler of handlers) {
                handler(args);
            }
        }
    }

    /**
     * @description unsubscribe event handler
     * @param event event name
     * @param handler event handler need unsubscribe
     */
    off<K extends keyof BreakpointEvents>(event: K, handler?: Handler<BreakpointEvents[K]>) {
        const handlers = this.eventsMap.get(event);

        if (handlers) {
            if (event && handler) {
                handlers.delete(handler);
            } else {
                this.eventsMap.delete(event);
            }
        }
    }
}