import {ISocketEvent} from "../interfaces/socket-event.interface";

export class SocketEvent {
    event: string;
    callback: ISocketEvent;

    constructor(event, callback, ...middlewares) {
        this.event = event;
        this.callback = (socket, data) => {
            const next = (function () {
                const next = middlewares.pop();
                next.call(next, socket, data);
            }).bind(this);
            middlewares.unshift(callback);
            next();
        }
    }
}