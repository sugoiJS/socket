import * as SocketIOStatic from "socket.io";
export interface ISocketHandler {
    socket: SocketIOStatic.Socket;
    events: Array<{
        name: string;
        callback: (...values: any[]) => void;
    }>;
}
