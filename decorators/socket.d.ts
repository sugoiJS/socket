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
export declare function SocketOn(event: string, namespace?: string): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;
