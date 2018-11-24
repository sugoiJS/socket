import * as http from "http";
import {SocketService} from "./services/socket.service";
import {HandlerType, SocketHandler} from "../services/socket-handler.adapter";

const io = require('socket.io-client');
const SocketsAmount = 2;
let sockets = [];
let httpServer;
let httpServerAddr;
let ioServer;

beforeAll(async () => {
    httpServer = http.createServer().listen();
    httpServerAddr = httpServer.address();
    ioServer = SocketHandler.init(httpServer);


    return await new Promise(resolve => {
        let connected = 0;
        SocketHandler.getHandler().registerEvent(HandlerType.SOCKET, "connect",() => {
            ++connected === SocketsAmount ? resolve() : null;
        });
        for (let i = 0; i < SocketsAmount; i++) {
            const socket = io.connect(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`, {
                'reconnection delay': 0,
                'reopen delay': 0,
                'force new connection': true,
                transports: ['websocket'],
            });
            sockets.push(socket);
        }
    });
});

afterAll(() => {
    httpServer.close();
    sockets.forEach((socket) => socket.disconnect());
});

describe('basic socket features', () => {
    test('should connect', () => {
        expect(SocketService.connectedAmount).toEqual(SocketsAmount);
    });

    test('add handler for socket', async () => {
        expect.assertions(1);
        return new Promise(resolve => {
            function helloHandler(socket, data) {
                expect(data).toBe("world");
                resolve();
            }

            SocketHandler.getHandler().registerEvent(HandlerType.SOCKET, "hello", helloHandler);
            SocketHandler.getHandler().getNamespace("/").emit("hello", "world");
        })
    })

    test('should disconnect', () => {
        expect.assertions(1);
        sockets[0].disconnect();
        return new Promise(resolve => {
            setTimeout(() => {
                expect(SocketService.connectedAmount).toEqual(SocketsAmount - 1);
                resolve();
            }, 50)
        })
    });

});