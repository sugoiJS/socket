import {
    BreakMiddleware,
    SocketOn,
    SocketOnByHandler,
    SocketServerOnByHandler,
    SocketServerEvents,
    SocketServerOn
} from "../../index";
import SocketIOStatic = require("socket.io");

export class SocketService {
    static connectedAmount = 0;
    static socketIds = {};
    static lastMessage: string;
    static lastConnected: string;

    @SocketServerOn(SocketServerEvents.CONNECTION, "/", ((socket, data) => SocketService.socketIds[socket.id] = true ))
    static handleConnection(socket: SocketIOStatic.Socket) {
        SocketService.connectedAmount++;
        console.log("new connection %s, amount: %s", socket.id, SocketService.connectedAmount);
        socket.emit("connected", {status: true})
    }

    @SocketServerOnByHandler(SocketServerEvents.CONNECTION, "/", 0, ((socket, data) => {
        SocketService.lastConnected = socket.id;
        BreakMiddleware()
    }))
    static handleConnection2(socket, data) {
        SocketService.lastConnected = null;
    }

    @SocketOn(SocketServerEvents.DISCONNECT, "/")
    static handleDisconnect(socket: SocketIOStatic.Socket, data) {
        SocketService.connectedAmount--;
        console.log("disconnection, amount: %s", SocketService.connectedAmount);
    }

    @SocketOnByHandler("message", "/", 0, ((socket, data: any) => {
        data.timestamp = new Date();
    }))
    static getMessage(socket, data) {
        this.lastMessage = data;
    }

}