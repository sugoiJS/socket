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

export function SocketOn(event:string);
export function SocketOn(event:string,namespace:string);
export function SocketOn(event:string,namespace:string,handlerId:string);
export function SocketOn(event:string,namespace:string="/",handlerId:string = null){
    return function (target, propertyKey: string, descriptor: PropertyDescriptor){
        SocketHandler.getHandler(handlerId)
            .registerEvent(HandlerType.SOCKET,event, (data,socket)=>descriptor.value.apply(target,[data,socket],namespace));
    }
}

/**
 * Register event callback per namespace for Socket server events
 * @example
 *  @SocketServerOn('connection')
 *  logging(data,socket){
 *      console.log(data);
 *      socket.emit("logged",data);
 *  }
 * @param {string} event
 * @param {string} namespace
 * @param {string} handlerId
 * @returns {(target, propertyKey: string, descriptor: PropertyDescriptor) => any}
 */

export function SocketServerOn(event:string);
export function SocketServerOn(event:string,namespace:string);
export function SocketServerOn(event:string,namespace:string,handlerId:string);
export function SocketServerOn(event:string,namespace:string="/",handlerId:string = null){
    return function (target, propertyKey: string, descriptor: PropertyDescriptor){
        SocketHandler.getHandler(handlerId)
            .registerEvent(HandlerType.SERVER,event, (data,socket)=>descriptor.value.apply(target,[data,socket],namespace));
    }
}