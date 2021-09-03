import {SocketIOStatic} from "../index";
import {ISocketHandler} from "../interfaces/socket-handler.interface";
import {NamespaceHandler} from "../classes/namespace-handler.class";
import {ISocketMiddleware} from "../interfaces/socket-middleware.interface";
import {ISocketServerMiddleware} from "../interfaces/socket-server-middleware.interface";
import {IExtendedSocket} from "../interfaces/extended-socket.interface";

export enum HandlerType {
    SERVER = "SERVER",
    SOCKET = "SOCKET"
}


export class SocketHandler implements ISocketHandler {
    public static readonly COUNTER_START = 1;
    public static readonly IDPrefix = "SUG_SOCKET_HANDLER_";
    private static counter = SocketHandler.COUNTER_START;

    protected static socketHandlers: Map<Symbol, SocketHandler> = new Map();
    protected static _handlersIds: Map<Symbol, string> = new Map();
    protected static _pendingMap: { [prop: string]: Map<string, Array<any>> } = {
        [HandlerType.SERVER]: new Map(),
        [HandlerType.SOCKET]: new Map()
    };

    private _namespaces: Map<string, NamespaceHandler> = new Map();
    private _socketServer: IOptimizedServerInstance;


    public static init(port: number): SocketIOStatic.Server
    public static init(port: number, socketConfig: SocketIOStatic.ServerOptions): SocketIOStatic.Server
    public static init(port: number, socketConfig: SocketIOStatic.ServerOptions, namespace: string): SocketIOStatic.Server
    public static init(HttpServer: any): SocketIOStatic.Server
    public static init(HttpServer: any, socketConfig: SocketIOStatic.ServerOptions): SocketIOStatic.Server
    public static init(HttpServer: any, socketConfig: SocketIOStatic.ServerOptions, namespace: string): SocketIOStatic.Server
    public static init(HttpServer: any,
                       socketConfig: SocketIOStatic.ServerOptions = undefined,
                       namespace: string = "/"): SocketIOStatic.Server {
        const serverSymbol = Symbol.for(HttpServer);
        const id = SocketHandler._handlersIds.has(serverSymbol)
        ? SocketHandler._handlersIds.get(serverSymbol)
        : SocketHandler.IDPrefix + this.counter++;
        let socketHandler;
        if (this.socketHandlers.has(Symbol.for(id))) {
            socketHandler = this.socketHandlers.get(Symbol.for(id));
            socketHandler.addNamespace(namespace);
        } else {
            socketHandler = new this(HttpServer, id, socketConfig, namespace);
            this.socketHandlers.set(Symbol.for(id), socketHandler);
            SocketHandler._handlersIds.set(serverSymbol, id);
        }
        return socketHandler.getServer();
    }

    public static getHandler(): SocketHandler
    public static getHandler(id: string): SocketHandler
    public static getHandler(id: string = null): SocketHandler {
        if (id) {
            return this.socketHandlers.get(Symbol.for(id));
        }
        else if (this.socketHandlers.size > 0) {
            return this.socketHandlers.get(Symbol.for(SocketHandler.IDPrefix + SocketHandler.COUNTER_START));
        } else {
            return null;
        }
    }

    protected constructor(HttpServer, id: string, socketConfig: SocketIOStatic.ServerOptions, namespace: string = "/") {
        this._socketServer = require('socket.io')(HttpServer, socketConfig);
        this._socketServer.instanceId = id;
        this._socketServer.getInstanceId = function () {
            return this.instanceId;
        };
        this.addNamespace(namespace)
    }

    addNamespace(namespace: string): NamespaceHandler;
    addNamespace(namespace: string, ...middlewares: Array<ISocketServerMiddleware>): NamespaceHandler;
    addNamespace(namespace: string, ...middlewares: Array<ISocketServerMiddleware>): NamespaceHandler {
        if (!(!!namespace && !this._namespaces.has(namespace))) return;

        const namespaceServer = this._socketServer.of(namespace);
        const namespaceHandler = new NamespaceHandler(namespace, namespaceServer, ...middlewares);
        if (SocketHandler._pendingMap[HandlerType.SOCKET].has(namespace)) {
            SocketHandler._pendingMap[HandlerType.SOCKET].get(namespace).forEach(item => {
                namespaceHandler.registerSocketEvent(item.event, item.callback, ...item.middlewares)
            });
            // SocketHandler._pendingMap[HandlerType.SOCKET].delete(namespace);
        }
        if (SocketHandler._pendingMap[HandlerType.SERVER].has(namespace)) {
            SocketHandler._pendingMap[HandlerType.SERVER].get(namespace).forEach(item => {
                namespaceHandler.registerServerEvent(item.event, item.callback, ...item.middlewares)
            });
            SocketHandler._pendingMap[HandlerType.SERVER].delete(namespace);
        }
        this._namespaces.set(namespace, namespaceHandler);
        return namespaceHandler;
    }


    static RegisterEvent<T>(handlerType: HandlerType, event: string, callback: (socket: IExtendedSocket, data: T) => void, namespace: string);
    static RegisterEvent<T>(handlerType: HandlerType, event: string, callback: (socket: IExtendedSocket, data: T) => void, middlewares: Array<ISocketMiddleware>);
    static RegisterEvent<T>(handlerType: HandlerType, event: string, callback: (socket: IExtendedSocket, data: T) => void, middlewares: Array<ISocketMiddleware>, namespace: string);
    static RegisterEvent<T=any>(handlerType: HandlerType, event, callback, middlewares?: Array<any> | string, namespace: string = "/") {
        if (typeof middlewares === "string") {
            namespace = middlewares as string;
            middlewares = []
        }
        const namespaceArray = this._pendingMap[handlerType].get(namespace) || [];
        namespaceArray.push({event, callback, middlewares: middlewares || []});
        this._pendingMap[handlerType].set(namespace, namespaceArray);
    };


    registerEvent<T>(handlerType: HandlerType, event: string, callback: (socket: IExtendedSocket, data: T) => void);
    registerEvent<T>(handlerType: HandlerType, event: string, callback: (socket: IExtendedSocket, data: T) => void, namespace: string);
    registerEvent<T>(handlerType: HandlerType, event: string, callback: (socket: IExtendedSocket, data: T) => void, middlewares: Array<ISocketMiddleware>);
    registerEvent<T>(handlerType: HandlerType, event: string, callback: (socket: IExtendedSocket, data: T) => void, middlewares: Array<ISocketMiddleware>, namespace: string);
    registerEvent<T=any>(handlerType: HandlerType, event, callback, middlewares: Array<any> | string = [], namespace: string = null) {
        if (typeof middlewares === "string") {
            namespace = middlewares as string;
            middlewares = []
        } else if (!namespace) {
            namespace = "/"
        }
        let handler = this.getNamespaceHandler(namespace);
        if (!handler && !(handler = this.addNamespace(namespace)))
            SocketHandler.RegisterEvent(handlerType, event, callback, middlewares, namespace);
        else
            handler.registerEvent(handlerType, event, callback, ...middlewares);
    }

    registerSocketEvent<T>(event: string, callback: (socket: IExtendedSocket, data: T) => void);
    registerSocketEvent<T>(event: string, callback: (socket: IExtendedSocket, data: T) => void, namespace: string);
    registerSocketEvent<T>(event: string, callback: (socket: IExtendedSocket, data: T) => void, middlewares: Array<ISocketMiddleware>);
    registerSocketEvent<T>(event: string, callback: (socket: IExtendedSocket, data: T) => void, middlewares: Array<ISocketMiddleware>, namespace: string);
    registerSocketEvent<T=any>(event: string, callback: (socket: IExtendedSocket, data: T) => void, middlewares?: Array<ISocketMiddleware> | string, namespace: string = "/") {
        this.registerEvent(HandlerType.SOCKET, event, callback, middlewares as Array<ISocketMiddleware>, namespace);
    }

    registerServerEvent<T>(event: string, callback: (socket: IExtendedSocket, data: T) => void);
    registerServerEvent<T>(event: string, callback: (socket: IExtendedSocket, data: T) => void, namespace: string);
    registerServerEvent<T>(event: string, callback: (socket: IExtendedSocket, data: T) => void, middlewares: Array<ISocketMiddleware>);
    registerServerEvent<T>(event: string, callback: (socket: IExtendedSocket, data: T) => void, middlewares: Array<ISocketMiddleware>, namespace: string);
    registerServerEvent<T=any>(event: string, callback: (socket: IExtendedSocket, data: T) => void, middlewares?: Array<ISocketMiddleware> | string, namespace: string = "/") {
        this.registerEvent(HandlerType.SERVER, event, callback, middlewares as Array<ISocketMiddleware>, namespace);
    }



    deregisterSocketEvent(event: string);
    deregisterSocketEvent(event: string, functionToRemove: (...args) => void);
    deregisterSocketEvent(event: string, functionToRemove: (...args) => void, namespace: string);
    deregisterSocketEvent(event, functionToRemove: (...args) => void = null, namespace = "/") {
        const handler = this.getNamespaceHandler(namespace);
        if (handler)
            handler.deregisterSocketEvent( event, functionToRemove);
    }


    deregisterServerEvent(event: string);
    deregisterServerEvent(event: string, functionToRemove: (...args) => void);
    deregisterServerEvent(event: string, functionToRemove: (...args) => void, namespace: string);
    deregisterServerEvent(event, functionToRemove: (...args) => void = null, namespace = "/") {
        const handler = this.getNamespaceHandler(namespace);
        if (handler)
            handler.deregisterServerEvent(event, functionToRemove);
    }

    getNamespace(namespace: string): SocketIOStatic.Namespace {
        return this._namespaces.has(namespace)
            ? this._namespaces.get(namespace).instance
            : null;
    }

    getServer(): IOptimizedServerInstance {
        return this._socketServer;
    }

    private getNamespaceHandler(namespace: string): NamespaceHandler {
        return this._namespaces.get(namespace);
    }

}


export type IOptimizedServerInstance = SocketIOStatic.Server & {
    getInstanceId(): string;
    instanceId: string;
};