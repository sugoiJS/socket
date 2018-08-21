"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("../index");
var connection_status_constant_1 = require("../constants/connection-status.constant");
var core_1 = require("@sugoi/core");
var socketService = /** @class */ (function () {
    function socketService() {
        this.namespace = "/";
    }
    socketService_1 = socketService;
    socketService.getSocketServerByNamespace = function (namespace) {
        return socketService_1.socketServers.has(namespace)
            ? socketService_1.socketServers.get(namespace).instance
            : null;
    };
    Object.defineProperty(socketService.prototype, "socketServer", {
        get: function () {
            return socketService_1.getSocketServerByNamespace(this.namespace);
        },
        enumerable: true,
        configurable: true
    });
    socketService.init = function (HttpServer, namespace, socketConfig, connectionCallback, disconnectCallback) {
        var _this = this;
        if (namespace === void 0) { namespace = "/"; }
        if (socketConfig === void 0) { socketConfig = {}; }
        if (connectionCallback === void 0) { connectionCallback = function () {
        }; }
        if (disconnectCallback === void 0) { disconnectCallback = function () {
        }; }
        var socketServer = require('socket.io')(HttpServer, socketConfig);
        socketServer.use(index_1.socketCookieParser);
        socketServer.on('connection', function (socket) {
            connectionCallback(socket);
            _this.setHandlers(namespace, socket);
        });
        socketServer.on('disconnect', function (socket) {
            disconnectCallback(socket);
        });
        socketService_1.socketServers.set(namespace, { instance: socketServer, status: connection_status_constant_1.CONNECTION_STATUS.CONNECTED });
        return socketServer;
    };
    socketService.addHandler = function (event, callback, namespace) {
        if (namespace === void 0) { namespace = "/"; }
        var handlers;
        var handler = { event: event, callback: callback };
        if (!socketService_1.Handlers.has(namespace)) {
            handlers = [];
        }
        else {
            handlers = socketService_1.Handlers.get(namespace);
        }
        handlers.push(handler);
        socketService_1.Handlers.set(namespace, handlers);
        if (socketService_1.socketServers.has(namespace)
            && socketService_1.socketServers.get(namespace).status === connection_status_constant_1.CONNECTION_STATUS.CONNECTED) {
            var server = socketService_1.socketServers.get(namespace).instance;
            Object['values'](server.sockets.sockets).forEach(function (socket) {
                socketService_1.setHandler(socket, handler);
            });
        }
    };
    socketService.setHandlers = function (namespace, socket) {
        if (socketService_1.Handlers.has(namespace) && socketService_1.socketServers.has(namespace)) {
            var server = socketService_1.socketServers.get(namespace).instance;
            socketService_1.Handlers.get(namespace)
                .forEach(function (ev) { return socketService_1.setHandler(socket, ev); });
        }
    };
    socketService.setHandler = function (socket, handler) {
        socket.on(handler.event, function (data) { return handler.callback(data, socket); });
    };
    var socketService_1;
    socketService.socketServers = new Map();
    socketService.Handlers = new Map();
    socketService = socketService_1 = __decorate([
        core_1.Injectable()
    ], socketService);
    return socketService;
}());
exports.socketService = socketService;
