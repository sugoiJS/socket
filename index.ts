
export * from "./utils/socket.utils";

export {SocketSchemaPolicy} from "./decorators/schema-policy.decorator";

export {ISocketServerMiddleware} from "./interfaces/socket-server-middleware.interface";

export {SocketHandler} from "./services/socket-handler.adapter";

export {SocketServerEvents} from "./constants/socket-server-events.constant";

export {SocketServerOnByHandler,SocketOnByHandler,SocketOn, SocketServerOn} from "./decorators/socket";

export {HandlerType} from "./services/socket-handler.adapter";


import * as SocketIOStatic from "socket.io";
import * as socketCookieParser from "socket.io-cookie";

export {SocketIOStatic};
export {socketCookieParser};


