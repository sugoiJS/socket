import SocketIOStatic = require("socket.io");

export type IExtendedSocket = SocketIOStatic.Socket & {
    getSocketServer():SocketIOStatic.Server;
    getSocketNamespace():SocketIOStatic.Namespace;
}