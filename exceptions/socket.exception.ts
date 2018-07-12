import {SugoiError} from "@sugoi/core";

export class SocketError extends SugoiError {
    constructor(message, code) {
        super(message, code);
    }
}