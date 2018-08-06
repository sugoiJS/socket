import {SocketIOStatic} from "../index";
import {socketCookieParser} from "../index";
import {injectable} from "inversify";
import {CONNECTION_STATUS} from "@sugoi/core";

@injectable()
export abstract class socketService {
    protected static readonly socketServers: Map<string, { instance: SocketIOStatic.Server, status: CONNECTION_STATUS }> = new Map();
    private static readonly Handlers: Map<string, Array<{ event: string, callback: (...args) => void }>> = new Map();

    protected namespace: string = "/";

    public static getSocketServerByNamespace(namespace: string): SocketIOStatic.Server {
        return socketService.socketServers.has(namespace)
            ? socketService.socketServers.get(namespace).instance
            : null;
    }

    protected get socketServer(): SocketIOStatic.Server {
        return socketService.getSocketServerByNamespace(this.namespace);
    }

    public static init(HttpServer,
                       namespace: string = "/",
                       socketConfig={},
                       connectionCallback:(socket?:SocketIOStatic.Socket)=>void = ()=>{},
                       disconnectCallback:(socket?:SocketIOStatic.Socket)=>void = ()=>{}
                       ): SocketIOStatic.Server {
        const socketServer = require('socket.io')(HttpServer,socketConfig);
        socketServer.use(socketCookieParser);
        socketServer.on('connection', (socket) => {
            connectionCallback(socket);
            this.setHandlers(namespace, socket);
        });
        socketServer.on('disconnect', (socket) => {
            disconnectCallback(socket)
        });
        socketService.socketServers.set(namespace, {instance: socketServer, status: CONNECTION_STATUS.CONNECTED});
        return socketServer;
    }

    public static addHandler(event: string, callback: (...args) => void, namespace: string = "/"): void {
        let handlers;
        const handler = {event, callback};
        if (!socketService.Handlers.has(namespace)) {
            handlers = [];
        }
        else {
            handlers = socketService.Handlers.get(namespace);
        }
        handlers.push(handler);
        socketService.Handlers.set(namespace, handlers);
        if (socketService.socketServers.has(namespace)
            && socketService.socketServers.get(namespace).status === CONNECTION_STATUS.CONNECTED) {
            const server = socketService.socketServers.get(namespace).instance;
            Object['values'](server.sockets.sockets).forEach(socket => {
                socketService.setHandler(socket, handler);
            });
        }

    }

    protected static setHandlers(namespace: string, socket: SocketIOStatic.Socket): void {
        if (socketService.Handlers.has(namespace) && socketService.socketServers.has(namespace)) {
            const server = socketService.socketServers.get(namespace).instance;
            socketService.Handlers.get(namespace)
                .forEach(ev => socketService.setHandler(socket, ev))
        }
    }

    protected static setHandler(socket: SocketIOStatic.Socket, handler: { event: string, callback: (data,socket) => void }) :void {
        socket.on(handler.event, data=>handler.callback(data,socket));
    }
}