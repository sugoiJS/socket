import {ISocketEvent} from "../interfaces/socket-event.interface";
import SocketIOStatic = require("socket.io");
import {EXCEPTIONS} from "../constants/exceptions.constant";

export class SocketEvent {
    event: string;
    callback: ISocketEvent;

    constructor(event, callback: (socket: SocketIOStatic.Socket, ...args: any[]) => void, ...middlewares) {
        this.event = event;
        this.callback = (socket, ...data) => {
            const next = (async function () {
                const clonedMiddlewares = [...middlewares];
                while (clonedMiddlewares.length > 0) {
                    const next = clonedMiddlewares.pop();
                    try {
                        await next.call(next, socket, ...data);
                    } catch (err) {
                        if(err && !(err.message === EXCEPTIONS.BREAK_MIDDLEWARE.message && err.code === EXCEPTIONS.BREAK_MIDDLEWARE.code))
                            console.error("Socket callback stopped because of an unhandled error. %s", err.stack);
                        break;
                    }
                }
            }).bind(this);
            next();
        };
        middlewares.unshift(callback);

    }
}