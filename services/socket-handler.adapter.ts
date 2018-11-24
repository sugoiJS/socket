import {SocketIOStatic} from "../index";
import {ISocketHandler} from "../interfaces/socket-handler.interface";
import {NamespaceHandler} from "../classes/namespace-handler.class";
import {ISocketMiddleware} from "../interfaces/socket-middleware.interface";

export class SocketHandler implements ISocketHandler {
    protected static socketHandlers: Map<Symbol, SocketHandler> = new Map();

    private _namespaces: Map<string, NamespaceHandler> = new Map();
    private _socketServer: SocketIOStatic.Server;


    public static init(HttpServer: any): SocketIOStatic.Server
    public static init(HttpServer: any, socketConfig: SocketIOStatic.ServerOptions): SocketIOStatic.Server
    public static init(HttpServer: any, socketConfig: SocketIOStatic.ServerOptions, namespace: string): SocketIOStatic.Server
    public static init(HttpServer: any,
                       socketConfig: SocketIOStatic.ServerOptions = {},
                       namespace: string = "/"): SocketIOStatic.Server {
        const address = HttpServer.address() as string;
        let socketHandler;
        if (this.socketHandlers.has(Symbol.for(address))) {
            socketHandler = this.socketHandlers.has(Symbol.for(address));
            socketHandler.addNamespace(namespace);
        } else {
            socketHandler = new this(HttpServer, socketConfig, namespace);
            this.socketHandlers.set(Symbol.for(address), socketHandler);
        }
        return socketHandler.getServer();
    }

    public static getHandler(id:string = null):SocketHandler{
        if(id) {
            return this.socketHandlers.get(Symbol(id));
        }
        else{
            return this.socketHandlers.values()[0];
        }
    }
    constructor(HttpServer, socketConfig: SocketIOStatic.ServerOptions, namespace: string = "/") {
        this._socketServer = require('socket.io')(HttpServer, socketConfig);
        this.addNamespace(namespace)
    }

    addNamespace(namespace: string);
    addNamespace(namespace: string, ...middlewares: Array<ISocketMiddleware>);
    addNamespace(namespace: string, ...middlewares: Array<ISocketMiddleware>) {
        if (!(!!namespace && !this._namespaces.has(namespace))) return;

        const namespaceServer = this._socketServer.of(namespace);
        this._namespaces.set(namespace, new NamespaceHandler(namespace, namespaceServer, ...middlewares));
    }

    registerEvent<T>(handlerType:HandlerType,event: string, callback: (socket: SocketIOStatic.Socket, data: T) => void);
    registerEvent<T>(handlerType:HandlerType,event: string, callback: (socket: SocketIOStatic.Socket, data: T) => void, namespace: string);
    registerEvent<T>(handlerType:HandlerType,event: string, callback: (socket: SocketIOStatic.Socket, data: T) => void, middlewares: Array<(socket: SocketIOStatic.Socket, data: T, next: any) => void>);
    registerEvent<T>(handlerType:HandlerType,event: string, callback: (socket: SocketIOStatic.Socket, data: T) => void, middlewares: Array<(socket: SocketIOStatic.Socket, data: T, next: any) => void>, namespace: string);
    registerEvent(handlerType:HandlerType,event, callback, middlewares?: Array<any> | string, namespace: string = "/") {
        if (typeof middlewares === "string") {
            namespace = middlewares as string;
            middlewares = []
        }
        const handler = this.getNamespaceHandler(namespace);
        if(handler)
            handler.registerEvent(handlerType,event,callback,...middlewares);
    }

    deregisterEvent(eventType:HandlerType,event: string);
    deregisterEvent(eventType:HandlerType,event: string, namespace: string);
    deregisterEvent(eventType:HandlerType,event, namespace?) {
        const handler = this.getNamespaceHandler(namespace);
        if(handler)
            handler.deregisterEvent(eventType,event);
    }

    getNamespace(namespace: string): SocketIOStatic.Namespace {
        return this._namespaces.has(namespace)
            ? this._namespaces.get(namespace).instance
            : null;
    }

    getServer(): SocketIOStatic.Server {
        return this._socketServer;
    }

    private getNamespaceHandler(namespace:string):NamespaceHandler{
        return this._namespaces.get(namespace);
    }

}


export enum HandlerType {
    SERVER = "SERVER",
    SOCKET = "SOCKET"
}


