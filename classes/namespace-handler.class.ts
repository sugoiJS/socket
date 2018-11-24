import {ISocketEvent} from "../interfaces/socket-event.interface";
import SocketIOStatic = require("socket.io");
import {CONNECTION_STATUS} from "../constants/connection-status.constant";
import {ISocketMiddleware} from "../interfaces/socket-middleware.interface";
import {socketCookieParser} from "../index";
import {HandlerType} from "../services/socket-handler.adapter";
import {SocketEvent} from "./socket-event";
import {SocketServerEvents} from "../constants/socket-server-events.constant";

export class NamespaceHandler {
    namespace: string;
    events: Array<{ event: string, callback: ISocketEvent }> = [];
    instance: SocketIOStatic.Namespace;
    status: CONNECTION_STATUS;
    middlewares: Array<ISocketMiddleware> = [];
    private serverEvents;

    constructor(namespace: string, instance: SocketIOStatic.Namespace, ...middlewares: Array<any>) {
        instance.use(socketCookieParser);
        this.namespace = namespace;
        this.instance = instance;
        this.status = instance.connected ? CONNECTION_STATUS.CONNECTED : CONNECTION_STATUS.DISCONNECTED;
        this.middlewares = middlewares;

        middlewares.forEach(middleware => instance.use(middleware));

        instance.on(SocketServerEvents.CONNECTION, (socket) => {
            this.events.forEach(event => {
                this.addHandlerByType(HandlerType.SOCKET, event.event, event.callback)
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
    }


    deregisterEvent(eventType: HandlerType, eventName: string) {
        eventName = eventName.toLowerCase();
        switch (eventType) {
            case HandlerType.SOCKET:
                this.events = this.events.filter(event => event.event.toLowerCase() !== eventName);
                Object['values'](this.instance.sockets).forEach((socket: SocketIOStatic.Socket) => {
                    socket.off(eventName, null);
                });
                break;
            case HandlerType.SERVER:
                this.serverEvents = this.serverEvents.filter(event => event.event.toLowerCase() !== eventName);
                this.instance.off(eventName, null);
                break;
        }
    }

    public addServerEventHandler(event: string, callback: (...args) => void, namespace: string = "/"): void {
        this.addHandlerByType(HandlerType.SERVER, event, callback, namespace);
    }

    public addSocketHandler(event: string, callback: (...args) => void, namespace: string = "/"): void {
        this.addHandlerByType(HandlerType.SOCKET, event, callback, namespace);
    }


    protected addHandlerByType(handlerType: HandlerType, event, callback, ...middlewares): void {
        const handler = new SocketEvent(event, callback, ...middlewares);
        switch (handlerType) {
            case HandlerType.SOCKET:
                this.setSocketHandlers(event, handler);
                break;
            case HandlerType.SERVER:
                this.setServerHandler(event, handler);
                break;
            default:
                break;
        }
    }


    private setSocketHandlers(server: SocketIOStatic.Namespace, handler: SocketEvent) {
        Object['values'](server.sockets).forEach(socket => {
            socket.on(handler.event, handler.callback);
        });
    }


    protected setServerHandler(recipient: SocketIOStatic.Namespace,
                               handler: SocketEvent): void {
        this.instance.on(handler.event, handler.callback);
    }

}