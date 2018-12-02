import SocketIOStatic = require("socket.io");

export type ISocketMiddleware = (socket:SocketIOStatic.Socket,data:any)=>Promise<any>|any;