import {ISocketEvent} from "../interfaces/socket-event.interface";
import SocketIOStatic = require("socket.io");
import {CONNECTION_STATUS} from "../constants/connection-status.constant";
import {ISocketMiddleware} from "../interfaces/socket-middleware.interface";
import {socketCookieParser} from "../index";
import {HandlerType} from "../services/socket-handler.adapter";
import {SocketEvent} from "./socket-event";
import {SocketServerEvents} from "../constants/socket-server-events.constant";
import {ISocketServerMiddleware} from "../interfaces/socket-server-middleware.interface";

export class NamespaceHandler {
    namespace: string;
    instance: SocketIOStatic.Namespace;
    status: CONNECTION_STATUS;
    private middlewares: Array<any> = [];
    private events: Array<SocketEvent> = [];
    private serverEvents: Array<SocketEvent> = [];

    constructor(namespace: string, instance: SocketIOStatic.Namespace, ...middlewares: Array<ISocketServerMiddleware>) {
        this.namespace = namespace;
        this.instance = instance;
        this.status = instance.connected ? CONNECTION_STATUS.CONNECTED : CONNECTION_STATUS.DISCONNECTED;
        this.middlewares = middlewares;
        this.middlewares.unshift(socketCookieParser);
        this.middlewares.forEach(middleware => instance.use(middleware));

        this.serverEvents.forEach(serverEvent => this.addHandlerByType(HandlerType.SERVER, serverEvent.event, serverEvent.callback))
        instance.on(SocketServerEvents.CONNECTION, (socket) => {
            this.events.forEach(event => {
                socket.on(event.event, data => event.callback(socket, data));
            });
        });
    }


    registerEvent(eventType: HandlerType, event: string, callback: ISocketEvent, ...middlewares: Array<ISocketMiddleware>) {
        const socketEvent = new SocketEvent(event, callback, ...middlewares);
        switch (eventType) {
            case HandlerType.SERVER:
                this.serverEvents.push(socketEvent);
                break;
            case HandlerType.SOCKET:
                this.events.push(socketEvent);
        }
        this.addHandlerByType(eventType, event, socketEvent.callback)
    }


    deregisterEvent(eventType: HandlerType, eventName: string, functionToRemove: (...args) => void) {
        eventName = eventName.toLowerCase();
        switch (eventType) {
            case HandlerType.SOCKET:
                this.events = this.events.filter(event => event.event.toLowerCase() !== eventName);
                Object['values'](this.instance.connected).forEach((socket: SocketIOStatic.Socket) => {
                    functionToRemove === null
                        ? socket.removeAllListeners(eventName)
                        : socket.removeListener(eventName, functionToRemove);
                });
                break;
            case HandlerType.SERVER:
                this.serverEvents = this.serverEvents.filter(event => event.event.toLowerCase() !== eventName);
                functionToRemove === null
                    ? this.instance.removeAllListeners(eventName)
                    : this.instance.removeListener(eventName, functionToRemove);
                break;
        }
    }

    public addServerEventHandler(event: string, callback: (...args) => void, ...middlewares: Array<ISocketMiddleware>): void {
        this.registerEvent(HandlerType.SERVER, event, callback, ...middlewares);
    }


    private addHandlerByType(handlerType: HandlerType, event, callback): void {
        switch (handlerType) {
            case HandlerType.SOCKET:
                this.setSocketHandlers(event, callback);
                break;
            case HandlerType.SERVER:
                this.setServerHandler(event, callback);
                break;
            default:
                break;
        }
    }


    private setSocketHandlers(event: string, callback: any) {
        for (let socketId of Object.keys(this.instance.connected)) {
            const socket = this.instance.connected[socketId];
            socket.on(event, (data) => callback(socket, data));
        }

    }


    private setServerHandler(event: string,
                             callback: any): void {
        this.instance.on(event, (data) => callback(data, this.instance));
    }

}