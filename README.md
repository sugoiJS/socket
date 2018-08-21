# @Sugoi\socket

![Sugoi logo](https://sugoijs.com/assets/logo_inverse.png)


## Introduction
SugoiJS is a minimal modular framework.

SugoiJS gives you the ability to use only what you need and do it fast.

this is a standalone module that can be functional on its own (as all of the SugoiJS modules).

The SugoiJS socket module uses the [socket.io](https://www.npmjs.com/package/socket.io).

## Installation

> npm install --save @sugoi/socket

### Bootstrapping
Bootstrapping done by:

    import {socketService} from "@sugoi/socket";

    // serverInstance is express\koa instance
    // in case you are using @socket\server, the instance returns from the 'listen' method
    socketService.init(serverInstance);


#### Socket Options

 Init socket server with:

 > namespace -  assign different endpoint to the socket server, more info on [socket.io documentation](https://socket.io/docs/rooms-and-namespaces/)

 > socketOptions - the socket server configurations

    socketService.init(serverInstance,namespace,socketOptions);

> The socketOptions variable interface is the same as on [socket.io documentation](https://socket.io/docs/server-api/)

     socketOptions:{
          path: string,
          serveClient: boolean,
          adapter:Adapter,
          origins:string,
          parser:Parser
     }

### Listen to events

SugoiJS socket module provides you the @SocketOn(event:string, namespace:string) decorator.

This decorator registers the callback for an event.

Example:

    @SocketOn('message')
    function(data,socket){
        socket.to(data.room).emit('message',data.message)
    }

You can use as many decorators as you want.

### Get instance

For getting the socketIO server instance, use the getSocketServerByNamespace socketService class method.

    const io:SocketIOStatic.Server = socketService.getSocketServerByNamespace("/");

## Documentation

You can find further information on [Sugoi official website](http://www.sugoijs.com)