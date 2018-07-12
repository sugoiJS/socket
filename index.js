"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var socket_1 = require("./decorators/socket");
exports.socketOn = socket_1.socketOn;
var socket_service_1 = require("./services/socket.service");
exports.socketService = socket_service_1.socketService;
require("rxjs");
