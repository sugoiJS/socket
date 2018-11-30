/**
 * Register event callback per namespace
 * @example
 *  @SocketOn('log')
 *  logging(data,socket){
 *      console.log(data);
 *      socket.emit("logged",data);
 *  }
 * @param {string} event
 * @param {string} namespace
 * @returns {(target, propertyKey: string, descriptor: PropertyDescriptor) => any}
 */

import {HandlerType, SocketHandler} from "../services/socket-handler.adapter";
import {ISocketMiddleware} from "../interfaces/socket-middleware.interface";

/**
 *
 * @param {string} event
 * @constructor
 */
export function SocketOn(event: string);
/**
 *
 * @param {string} event
 * @param {string} namespace
 * @constructor
 */
export function SocketOn(event: string, namespace: string);
/**
 *
 * @param {string} event
 * @param {string} namespace
 * @param {ISocketMiddleware} middlewares
 * @constructor
 */
export function SocketOn(event: string, namespace: string, ...middlewares:Array<ISocketMiddleware>);
export function SocketOn(event: string, namespace: string = "/", ...middlewares:Array<ISocketMiddleware>) {
    return function (target, propertyKey: string, descriptor: PropertyDescriptor) {
        registerSocketEvent(event,descriptor,target,middlewares,namespace);
    }
}

export function SocketOnByHandler(event: string);
export function SocketOnByHandler(event: string, namespace: string);
export function SocketOnByHandler(event: string, namespace: string, handlerId: string);
export function SocketOnByHandler(event: string, namespace: string, handlerId: string, ...middlewares: Array<ISocketMiddleware>);
export function SocketOnByHandler(event: string, namespace: string = "/", handlerId: string = null, ...middlewares: Array<ISocketMiddleware>) {
    return function (target, propertyKey: string, descriptor: PropertyDescriptor) {
        registerSocketEvent(event,descriptor,target,middlewares,namespace,handlerId);
    }
}


/**
 * Register event callback per namespace for Socket server events
 * @example
 *  @SocketServerOn('connection')
 *  logging(socket,data){
 *      console.log(data);
 *      socket.emit("logged",data);
 *  }
 * @param {string} event
 * @param {string} namespace
 * @param {Array<ISocketMiddleware>) middlewares
 * @returns {(target, propertyKey: string, descriptor: PropertyDescriptor) => any}
 */

export function SocketServerOn(event: string);
export function SocketServerOn(event: string, namespace: string);
export function SocketServerOn(event: string, namespace: string, ...middlewares:Array<ISocketMiddleware>);
export function SocketServerOn(event: string, namespace: string = "/", ...middlewares:Array<ISocketMiddleware>) {
    return function (target, propertyKey: string, descriptor: PropertyDescriptor) {
        registerServerEvent(event,descriptor,target,middlewares,namespace);
    }
}

export function SocketServerOnByHandler(event: string);
export function SocketServerOnByHandler(event: string, namespace: string);
export function SocketServerOnByHandler(event: string, namespace: string, handlerId: string);
export function SocketServerOnByHandler(event: string, namespace: string, handlerId: string, ...middlewares: Array<ISocketMiddleware>);
export function SocketServerOnByHandler(event: string, namespace: string = "/", handlerId: string = null, ...middlewares: Array<ISocketMiddleware>) {
    return function (target, propertyKey: string, descriptor: PropertyDescriptor) {
        registerServerEvent(event,descriptor,target,middlewares,namespace,handlerId);
    }
}


function registerServerEvent(event,descriptor,target,middlewares,namespace,handlerId = null){

    let handler = SocketHandler.getHandler(handlerId);
    if (handler)
        handler.registerServerEvent(event, descriptor.value.bind(target), middlewares,namespace);
    else
        SocketHandler.RegisterEvent(HandlerType.SERVER, event, descriptor.value.bind(target), middlewares,namespace);


}

function registerSocketEvent(event,descriptor,target,middlewares,namespace,handlerId = null){
    let handler = SocketHandler.getHandler(handlerId);
    if (handler)
        handler.registerSocketEvent(event, descriptor.value.bind(target),middlewares, namespace);
    else
        SocketHandler.RegisterEvent(HandlerType.SOCKET, event, descriptor.value.bind(target),middlewares, namespace);
}