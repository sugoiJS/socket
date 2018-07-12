# @Sugoi\socket

![Sugoi logo](../assets/logo_inverse.png)


## Introduction
The sugoi framework socket module using the [socket.io](https://www.npmjs.com/package/socket.io).

As all of the "Sugoi" modules, this module is stand alone and can act without other Sugoi modules.

## Installation

> npm install --save @sugoi/socket

### Bootstrapping

    import {socketService} from "@sugoi/socket";

    // serverInstance is express\koa instance
    // in case you are using @socket\server, the instance returns from the 'listen' method
    socketService.init(serverInstance);

#### Socket Options
    socketService.init(serverInstance,namespace,socketOptions);

> socketOptions is the same as on [socket.io documation](https://socket.io/docs/server-api/)

     socketOptions:{
          path: string,
          serveClient: boolean,
          adapter:Adapter,
          origins:string,
          parser:Parser
     }

### Listen to events

Sugoi socket module provide you the @socketOn(event:string, namespace:string) decorator.

This decorator register the function as a callback for event.
Example:

    @socketOn('message')
    function(data,socket){
        socket.to(data.room).emit('message',data.message)
    }


### Get instance

For getting the socketIO server instance you should user the getSocketServerByNamespace socketService class method.

    const io:SocketIOStatic.Server = socketService.getSocketServerByNamespace("/");

## Documentation

You can find further information on [Sugoi official website](http://www.sugoijs.com)