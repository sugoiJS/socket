import {EXCEPTIONS} from "../constants/exceptions.constant";
import {SocketHandlerException} from "../exceptions/socket-handler.exception";

export function BreakMiddleware(){
    throw new SocketHandlerException(EXCEPTIONS.BREAK_MIDDLEWARE.message,EXCEPTIONS.BREAK_MIDDLEWARE.code);
}