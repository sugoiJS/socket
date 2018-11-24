import {SocketServerEvents,SocketServerOn} from "../../index";
import SocketIOStatic = require("socket.io");
import {SocketOn} from "../../decorators/socket";

export class SocketService {
    static connectedAmount = 0;

    @SocketServerOn(SocketServerEvents.CONNECTION)
    static handleConnection(socket:SocketIOStatic.Socket){
        SocketService.connectedAmount++;
        console.log("new connection, amount: %s",SocketService.connectedAmount);
        socket.emit("connected",{status:true})
    }

    @SocketOn(SocketServerEvents.DISCONNECT)
    static handleDisconnect(socket:SocketIOStatic.Socket){
        SocketService.connectedAmount--;
        console.log("disconnection, amount: %s",SocketService.connectedAmount);
    }

}