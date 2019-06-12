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
 * @param {ISocketMiddleware} middleware
 * @constructor
 */
export function SocketOn(event: string, middleware: ISocketMiddleware);
/**
 *
 * @param {string} event
 * @param {string} namespace
 * @param {ISocketMiddleware} middlewares
 * @constructor
 */
export function SocketOn(event: string, namespace?: string, ...middlewares: Array<ISocketMiddleware>);
export function SocketOn(event: string, middleware?: ISocketMiddleware, ...middlewares: Array<ISocketMiddleware>);
export function SocketOn(event: string, namespaceOrMiddleware: ISocketMiddleware |string = "/", ...middlewares: Array<ISocketMiddleware>) {
    let namespace = namespaceOrMiddleware;
    if(typeof namespaceOrMiddleware !== 'string'){
        if(namespaceOrMiddleware){
            middlewares.unshift(<ISocketMiddleware>namespaceOrMiddleware);
        }
        namespace = '/';
    }
    return function (target, propertyKey: string, descriptor: PropertyDescriptor) {
        registerSocketEvent(event, descriptor, target, middlewares, namespace);
    }
}

export function SocketOnByHandler(event: string);
export function SocketOnByHandler(event: string, namespace: string);
export function SocketOnByHandler(event: string, namespace: string, handlerId: string);
export function SocketOnByHandler(event: string, namespace: string, handlerId: string, ...middlewares: Array<ISocketMiddleware>);

export function SocketOnByHandler(event: string, middleware: ISocketMiddleware);
export function SocketOnByHandler(event: string, middleware: ISocketMiddleware, handlerId: string);
export function SocketOnByHandler(event: string, middleware: ISocketMiddleware, handlerId: string, ...middlewares: Array<ISocketMiddleware>);

export function SocketOnByHandler(event: string, namespaceOrMiddleware: ISocketMiddleware|string = "/", handlerId: string = null, ...middlewares: Array<ISocketMiddleware>) {
    let namespace = namespaceOrMiddleware;
    if(typeof namespaceOrMiddleware !== 'string'){
        if(namespaceOrMiddleware){
            middlewares.unshift(<ISocketMiddleware>namespaceOrMiddleware);
        }
        namespace = '/';
    }
    return function (target, propertyKey: string, descriptor: PropertyDescriptor) {
        registerSocketEvent(event, descriptor, target, middlewares, namespace, handlerId);
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
export function SocketServerOn(event: string, namespace: string, ...middlewares: Array<ISocketMiddleware>);
export function SocketServerOn(event: string, middleware: ISocketMiddleware);
export function SocketServerOn(event: string, middleware: ISocketMiddleware, ...middlewares: Array<ISocketMiddleware>);
export function SocketServerOn(event: string, namespaceOrMiddleware: ISocketMiddleware | string = "/", ...middlewares: Array<ISocketMiddleware>) {
    let namespace = namespaceOrMiddleware;
    if(typeof namespaceOrMiddleware !== 'string'){
        if(namespaceOrMiddleware){
            middlewares.unshift(<ISocketMiddleware>namespaceOrMiddleware);
        }
        namespace = '/';
    }
    return function (target, propertyKey: string, descriptor: PropertyDescriptor) {
        registerServerEvent(event, descriptor, target, middlewares, namespace);
    }
}

export function SocketServerOnByHandler(event: string);
export function SocketServerOnByHandler(event: string, namespace: string);
export function SocketServerOnByHandler(event: string, namespace: string, handlerId: string);
export function SocketServerOnByHandler(event: string, namespace: string, handlerId: string, ...middlewares: Array<ISocketMiddleware>);

export function SocketServerOnByHandler(event: string, middleware: ISocketMiddleware);
export function SocketServerOnByHandler(event: string, middleware: ISocketMiddleware, handlerId: string);
export function SocketServerOnByHandler(event: string, middleware: ISocketMiddleware, handlerId: string, ...middlewares: Array<ISocketMiddleware>);

export function SocketServerOnByHandler(event: string, namespaceOrMiddleware: ISocketMiddleware| string = "/", handlerId: string = null, ...middlewares: Array<ISocketMiddleware>) {
    let namespace = namespaceOrMiddleware;
    if(typeof namespaceOrMiddleware !== 'string'){
        if(namespaceOrMiddleware){
            middlewares.unshift(<ISocketMiddleware>namespaceOrMiddleware);
        }
        namespace = '/';
    }
    return function (target, propertyKey: string, descriptor: PropertyDescriptor) {
        registerServerEvent(event, descriptor, target, middlewares, namespace, handlerId);
    }
}


function registerServerEvent(event, descriptor, target, middlewares, namespace, handlerId = null) {
    defineDescriptorValueTarget(descriptor,target);
    let handler = SocketHandler.getHandler(handlerId);
    if (handler)
        handler.registerServerEvent(event, descriptor.value, middlewares, namespace);
    else
        SocketHandler.RegisterEvent(HandlerType.SERVER, event, descriptor.value, middlewares, namespace);


}

function registerSocketEvent(event, descriptor, target, middlewares, namespace, handlerId = null) {
    defineDescriptorValueTarget(descriptor,target);
    let handler = SocketHandler.getHandler(handlerId);
    if (handler)
        handler.registerSocketEvent(event, descriptor.value, middlewares, namespace);
    else
        SocketHandler.RegisterEvent(HandlerType.SOCKET, event, descriptor.value, middlewares, namespace);
}

function defineDescriptorValueTarget(descriptor, target) {
    descriptor.value = descriptor.value.bind(target);
}