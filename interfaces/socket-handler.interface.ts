
import {SocketIOStatic} from "../index";
import {HandlerType} from "../services/socket-handler.adapter";
import {NamespaceHandler} from "../classes/namespace-handler.class";

export interface ISocketHandler{

    registerEvent<T=any>(handlerType:HandlerType,event:string,callback:(socket:SocketIOStatic.Socket,data:T)=>void);
    registerEvent<T=any>(handlerType:HandlerType,event:string,callback:(socket:SocketIOStatic.Socket,data:T)=>void,namespace:string);
    registerEvent<T=any>(handlerType:HandlerType,event:string,callback:(socket:SocketIOStatic.Socket,data:T)=>void,middlewares:Array<(socket:SocketIOStatic.Socket,data:T,next:any)=>void>);
    registerEvent<T=any>(handlerType:HandlerType,event:string,callback:(socket:SocketIOStatic.Socket,data:T)=>void,middlewares:Array<(socket:SocketIOStatic.Socket,data:T,next:any)=>void>,namespace:string);

    deregisterEvent<T=any>(handlerType:HandlerType,event:string);
    deregisterEvent<T=any>(handlerType:HandlerType,event:string,namespace:string);


    addNamespace(namespace: string):NamespaceHandler;
    getNamespace(namespace:string):SocketIOStatic.Namespace;
    getServer():SocketIOStatic.Server;


}