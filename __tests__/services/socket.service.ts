import {
    BreakMiddleware,
    SocketOn,
    SocketOnByHandler,
    SocketServerOnByHandler,
    SocketServerEvents,
    SocketServerOn
} from "../../index";
import SocketIOStatic = require("socket.io");
import {SocketHandler} from "../../services/socket-handler.adapter";
import {Injectable, ComparableSchema, SchemaTypes} from "@sugoi/core";
import {SocketSchemaPolicy} from "../../decorators/schema-policy.decorator";

const instanceId = SocketHandler.IDPrefix + SocketHandler.COUNTER_START;

@Injectable()
export class SocketService {
    static connectedAmount = 0;
    static socketIds = {};
    static lastMessage: string;
    static lastConnected: string;
    public message = "wow!";

    @SocketOn(SocketServerEvents.DISCONNECT, "/")
    static handleDisconnect(socket: SocketIOStatic.Socket, data) {
        SocketService.connectedAmount--;
        console.log("disconnection, amount: %s", SocketService.connectedAmount);
    }


    @SocketOnByHandler("message", "/", instanceId, ((socket, data: any) => {
        if (!data) {
            BreakMiddleware()
        }
        data.timestamp = new Date();
    }))
    @SocketSchemaPolicy({msg:ComparableSchema.ofType(SchemaTypes.STRING).setMandatory(true)})
    static getMessage(socket, data) {
        this.lastMessage = data;
    }

    @SocketServerOn(SocketServerEvents.CONNECTION, "/", ((socket, data) => SocketService.socketIds[socket.id] = true ))
    static handleConnection(socket: SocketIOStatic.Socket) {
        SocketService.connectedAmount++;
        console.log("new connection %s, amount: %s", socket.id, SocketService.connectedAmount);
        socket.emit("connected", {status: true})
    }

    @SocketServerOnByHandler(SocketServerEvents.CONNECTION, "/", instanceId, ((socket, data) => {
        SocketService.lastConnected = socket.id;
        BreakMiddleware()
    }))
    static handleConnection2(socket, data) {
        SocketService.lastConnected = null;
    }
}