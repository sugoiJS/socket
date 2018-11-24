import * as SocketIOStatic from "socket.io";
import { CONNECTION_STATUS } from "@sugoi/core";
export declare abstract class socketService {
    protected static readonly socketServers: Map<string, {
        instance: SocketIOStatic.Server;
        status: CONNECTION_STATUS;
    }>;
    private static readonly Handlers;
    protected namespace: string;
    static getSocketServerByNamespace(namespace: string): SocketIOStatic.Server;
    protected readonly socketServer: SocketIOStatic.Server;
    static init(HttpServer: any, namespace?: string, socketConfig?: {}, connectionCallback?: (socket?: SocketIOStatic.Socket) => void, disconnectCallback?: (socket?: SocketIOStatic.Socket) => void): SocketIOStatic.Server;
    static addHandler(event: string, callback: (...args: any[]) => void, namespace?: string): void;
    protected static setHandlers(namespace: string, socket: SocketIOStatic.Socket): void;
    protected static setHandler(socket: SocketIOStatic.Socket, handler: {
        event: string;
        callback: (data: any, socket: any) => void;
    }): void;
}
