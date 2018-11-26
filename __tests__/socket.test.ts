import * as http from "http";
import {SocketService} from "./services/socket.service";
import {HandlerType, SocketHandler} from "../index";

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
        SocketHandler.getHandler().registerEvent(HandlerType.SOCKET, "connected", () => {
            if (++connected === SocketsAmount) {
                resolve();
            }
        });
        for (let i = 0; i < SocketsAmount; i++) {
            const socket = io.connect(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`,
            {
            'reconnection delay': 0,
            'reopen delay': 0,
            'force new connection': false,
            transports: ['websocket'],
            });
            sockets.push(socket);
            socket.emit("connected");
        }
    });
});

afterAll(() => {
    httpServer.close();
    sockets.forEach((socket) => {
        if (socket.connected)
            socket.disconnect()
    });
});

describe('basic socket features', () => {
    it('should connect', () => {
        expect(SocketService.connectedAmount).toEqual(SocketsAmount);
    });
    it('check last connect', () => {
        expect(SocketService.lastConnected).toEqual(sockets[1].id);
    });

    it('check last message', async () => {
        expect.assertions(2);
        const msg = {msg:"testing message"};
        sockets[1].emit("message",msg);
        return new Promise(resolve => {
            setTimeout(() => {
                expect(SocketService.lastMessage['msg']).toEqual(msg.msg);
                expect(SocketService.lastMessage['timestamp']).toBeDefined();
                resolve();
            },50)
        })
    });

    it('check last message - detached', async () => {
        expect.assertions(1);
        SocketHandler.getHandler().deregisterSocketEvent("message");
        const msg = {msg:"testing message-2"};
        sockets[1].emit("message",msg);
        return new Promise(resolve => {
            setTimeout(() => {
                expect(SocketService.lastMessage['msg']).not.toEqual(msg.msg);
                resolve();
            },50)
        })
    });

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

// describe("dynamic events", () => {
//     it('add handler for socket', async () => {
//         expect.assertions(1);
//
//         return new Promise(resolve => {
//
//             function greetingHandler(socket, data) {
//                 console.log(data);
//                 expect(data).toEqual(["world", "1"]);
//                 resolve();
//             }
//
//             SocketHandler.getHandler().registerSocketEvent("greeting", greetingHandler)
//             console.log(sockets[1].eventNames)
//             // ,
//                 // [
//                 //     (socket, ...data: Array<any>) => {
//                 //         console.log(data);
//                 //         data.push("middleware");
//                 //     }
//                 // ]);
//             SocketHandler.getHandler().getNamespace("/").emit("greeting", ["world", "1"]);
//         })
//     });
//
// });