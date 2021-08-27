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
        this.status = instance.sockets.size ? CONNECTION_STATUS.CONNECTED : CONNECTION_STATUS.DISCONNECTED;
        this.middlewares = middlewares;
        // this.middlewares.unshift(socketCookieParser);
        this.middlewares.forEach(middleware => instance.use(middleware));

        this.serverEvents.forEach(serverEvent => this.addHandlerByType(HandlerType.SERVER, serverEvent))
        instance.on(SocketServerEvents.CONNECTION, (socket) => {
            this.extendSocketObject(socket);
            this.events.forEach(event => {
                socket.on(event.event, event.extendCallback(data => event.callback(socket, data)));
            });
        });
    }

    private extendSocketObject(socket){
        socket._namespaceInstance = this.instance;
        socket._serverInstance = this.instance.server;
        socket.getSocketServer = function(){
            return this['_serverInstance'];
        };
        socket.getSocketNamespace = function(){
            return this['_namespaceInstance'];
        };
    }


    public registerSocketEvent(event: string, callback: (...args) => void, ...middlewares: Array<ISocketMiddleware>): void {
        this.registerEvent(HandlerType.SOCKET, event, callback, ...middlewares);
    }

    public registerServerEvent(event: string, callback: (...args) => void, ...middlewares: Array<ISocketMiddleware>): void {
        this.registerEvent(HandlerType.SERVER, event, callback, ...middlewares);
    }

    /**
     *
     * @param {string} eventName
     * @param {(...args) => void} functionToRemove - in case not passed, all the functions will remove
     */
    public deregisterSocketEvent(eventName: string, functionToRemove?: (...args) => void) {
        this.deregisterEvent(HandlerType.SOCKET, eventName, functionToRemove)
    }

    public deregisterServerEvent(eventName: string, functionToRemove: (...args) => void) {
        this.deregisterEvent(HandlerType.SERVER, eventName, functionToRemove)
    }

    public registerEvent(eventType: HandlerType, event: string, callback: ISocketEvent, ...middlewares: Array<ISocketMiddleware>) {
        const socketEvent = new SocketEvent(event, callback, ...middlewares);
        switch (eventType) {
            case HandlerType.SERVER:
                this.serverEvents.push(socketEvent);
                break;
            case HandlerType.SOCKET:
                this.events.push(socketEvent);
        }
        this.addHandlerByType(eventType, socketEvent)
    }


    private deregisterEvent(eventType: HandlerType, eventName: string, functionToRemove: (...args) => void) {
        eventName = eventName.toLowerCase();
        switch (eventType) {
            case HandlerType.SOCKET:
                this.events = this.events.filter(event => event.event.toLowerCase() !== eventName);
                Array.from(this.instance.sockets.values()).forEach((socket: SocketIOStatic.Socket) => {
                    if(!functionToRemove)
                        socket.removeAllListeners(eventName);
                    else {
                        socket.removeListener(eventName, functionToRemove);
                    }
                });
                break;
            case HandlerType.SERVER:
                this.serverEvents = this.serverEvents.filter(event => event.event.toLowerCase() !== eventName);
                if(!functionToRemove) {
                    this.instance.removeAllListeners(eventName)
                }else {
                    this.instance.removeListener(eventName, functionToRemove);
                }
                break;
        }
    }


    private addHandlerByType(handlerType: HandlerType, event:SocketEvent): void {
        switch (handlerType) {
            case HandlerType.SOCKET:
                this.setSocketHandlers(event);
                break;
            case HandlerType.SERVER:
                this.setServerHandler(event);
                break;
            default:
                break;
        }
    }


    private setSocketHandlers(event:SocketEvent) {
        for (let socket of this.instance.sockets.values()) {
            socket.on(event.event, event.extendCallback((data) => event.callback(socket, data)));
        }

    }


    private setServerHandler(event:SocketEvent): void {
        this.instance.on(event.event, event.extendCallback((data) => event.callback(data, this.instance)));
    }

}