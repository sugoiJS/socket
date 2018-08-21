import {socketService} from "../services/socket.service";

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
export function SocketOn(event:string,namespace:string="/"){
    return function (target, propertyKey: string, descriptor: PropertyDescriptor){
        socketService.addHandler(event, (data,socket)=>target[propertyKey](data,socket),namespace);
    }
}