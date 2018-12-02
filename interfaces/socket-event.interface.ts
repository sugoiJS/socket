import SocketIOStatic = require("socket.io");

export type ISocketEvent<Payload=any> = (socket:SocketIOStatic.Socket,data:Payload)=>void