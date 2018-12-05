import {EXCEPTIONS} from "../constants/exceptions.constant";

import {SocketError} from "../exceptions/socket.exception";


export function BreakMiddleware();
export function BreakMiddleware(reason:any);
export function BreakMiddleware(reason?:any){
    throw new SocketError(EXCEPTIONS.BREAK_MIDDLEWARE.message,EXCEPTIONS.BREAK_MIDDLEWARE.code,reason,false);
}