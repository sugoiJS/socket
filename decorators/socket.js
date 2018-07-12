"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var socket_service_1 = require("../services/socket.service");
function socketOn(event, namespace) {
    if (namespace === void 0) { namespace = "/"; }
    return function (target, propertyKey, descriptor) {
        socket_service_1.socketService.addHandler(event, function (data, socket) { return target[propertyKey](data, socket); }, namespace);
    };
}
exports.socketOn = socketOn;
