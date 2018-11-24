import SocketIOStatic = require("socket.io");

export type ISocketMiddleware = (socket:SocketIOStatic.Socket,next:ISocketMiddleware, data:any)=>void;