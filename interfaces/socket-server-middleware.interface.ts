import SocketIOStatic = require("socket.io");

export type ISocketServerMiddleware = (socket:SocketIOStatic.Socket, fn: (err?: any ) => void ) =>void;