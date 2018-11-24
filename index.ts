export {SocketHandler} from "./services/socket-handler.adapter";

export {SocketServerEvents} from "./constants/socket-server-events.constant";

export {SocketOn, SocketServerOn} from "./decorators/socket";

export {ISocketHandler} from "./interfaces/socket-handler.interface";


import * as SocketIOStatic from "socket.io";
import * as socketCookieParser from "socket.io-cookie";

export {SocketIOStatic};
export {socketCookieParser};
