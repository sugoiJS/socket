"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var socket_service_1 = require("../services/socket.service");
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
function SocketOn(event, namespace) {
    if (namespace === void 0) { namespace = "/"; }
    return function (target, propertyKey, descriptor) {
        socket_service_1.socketService.addHandler(event, function (data, socket) { return target[propertyKey](data, socket); }, namespace);
    };
}
exports.SocketOn = SocketOn;
