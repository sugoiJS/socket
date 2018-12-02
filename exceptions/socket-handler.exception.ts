
export class SocketHandlerException extends Error{
    constructor(message:string,public code:number){
        super(message)
    }
}