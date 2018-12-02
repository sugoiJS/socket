import {SocketService} from "./services/socket.service";
import {SocketHandler} from "../index";

const io = require('socket.io-client');
const SocketsAmount = 2;
const port = 3000;
let sockets = [];
let ioServer;

beforeAll(async () => {
    ioServer = SocketHandler.init(port);


    return await new Promise(resolve => {
        let connected = 0;
        SocketHandler.getHandler().registerSocketEvent("connected", () => {
            if (++connected === SocketsAmount) {
                resolve();
            }
        });
        for (let i = 0; i < SocketsAmount; i++) {
            const socket = io.connect(`http://127.0.0.1:${port}`,
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
    ioServer.close();
    sockets.forEach((socket) => {
        if (socket.connected)
            socket.disconnect()
    });
});

describe('basic socket features', () => {
    it('should connect', () => {
        expect(SocketService.connectedAmount).toEqual(SocketsAmount);
    });

    it('should have id', () => {
        expect(ioServer.getInstanceId()).toBe(SocketHandler.IDPrefix + SocketHandler.COUNTER_START);
        expect(SocketHandler.getHandler(ioServer.getInstanceId()).getServer()).toBe(ioServer);
    });

    it('check last connect', () => {
        expect(SocketService.lastConnected).toEqual(sockets[1].id);
    });

    it('check last message', async () => {
        expect.assertions(2);
        return new Promise(resolve => {
            const msg = {msg: "testing message"};
            sockets[1].emit("message", 1);// to cause unhandled exception
            sockets[1].emit("message", msg);
            sockets[1].emit("message", "");
            setTimeout(() => {
                expect(SocketService.lastMessage['msg']).toEqual(msg.msg);
                expect(SocketService.lastMessage['timestamp']).toBeDefined();
                resolve();
            }, 50)
        })
    });

    it('check last message - detached', async () => {
        expect.assertions(1);
        SocketHandler.getHandler().deregisterSocketEvent("message", SocketService.getMessage);
        return new Promise(resolve => {
            const msg = {msg: "testing message-2"};
            sockets[1].emit("message", msg);
            setTimeout(() => {
                expect(SocketService.lastMessage['msg']).not.toEqual(msg.msg);
                resolve();
            }, 50)
        })
    });

    it('check last message - reattach + detached single', async () => {
        expect.assertions(2);

        return new Promise(resolve => {
            SocketHandler.getHandler()
                .registerSocketEvent("message", SocketService.getMessage);

            let msg = {msg: "testing message-7"};
            sockets[1].emit("message", msg);
            setTimeout(() => {
                expect(SocketService.lastMessage['msg']).toEqual(msg.msg);
                const overrideMsg = {msg: "override"};
                SocketHandler.getHandler().deregisterSocketEvent("message", SocketService.getMessage);
                sockets[1].emit("message", overrideMsg);
                setTimeout(() => {
                    expect(SocketService.lastMessage['msg']).not.toEqual(overrideMsg);
                    resolve();
                }, 50)
            }, 50);

        })
    });

    it('check socket namespace & server', async () => {
        expect.assertions(2);
        return new Promise(resolve => {
            SocketHandler.getHandler().registerSocketEvent("test", ((socket) => {
                expect(socket.getSocketServer()).toBe(ioServer);
                expect(socket.getSocketNamespace()).toBe(SocketHandler.getHandler().getNamespace("/"));
                resolve();
            }));
            sockets[1].emit("test")
        });
    });

    it('should disconnect', () => {
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

describe("dynamic events", () => {
    it('add handler for socket', async () => {
        expect.assertions(1);

        return new Promise(resolve => {

            function greetingHandler(socket, data) {
                console.log(data);
                expect(data).toEqual(["world", "1", "middleware"]);
                resolve();
            }

            SocketHandler.getHandler().registerSocketEvent("greeting", greetingHandler,
                [
                    (socket, ...data: Array<any>) => {
                        data[0].push("middleware");
                    }
                ]);
            sockets[1].emit("greeting", ["world", "1"]);
        })
    });

});