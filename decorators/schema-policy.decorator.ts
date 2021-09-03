import {TComparableSchema, ValidateSchemaUtil} from "@sugoi/core";
import {SocketError} from "../exceptions/socket.exception";
import {EXCEPTIONS} from "../constants/exceptions.constant";

/**
 *
 * @returns {(target: any, property: string, descriptor: PropertyDescriptor) => any}
 * @constructor
 */
export function SocketSchemaPolicy(schema: TComparableSchema);
export function SocketSchemaPolicy(schema: TComparableSchema, exceptionErrorCode: number);
export function SocketSchemaPolicy(schema: TComparableSchema, exceptionErrorCode: number = 400) {
    return function (target: any, property: string, descriptor: PropertyDescriptor) {
        const originalFunction = descriptor.value;
        descriptor.value = new Proxy(originalFunction, {
            apply: (applyTarget, thisArg, argArray) => {
                validateSchema(schema, argArray[1], exceptionErrorCode);
                Reflect.apply(applyTarget, thisArg, argArray);
            }
        });
        Reflect.defineProperty(target, property, descriptor);
    }
}

function validateSchema(schema, data, exceptionErrorCode: number) {
    const validationRslt = ValidateSchemaUtil.ValidateSchema(data, schema);
    if (!validationRslt.valid) {
        throw new SocketError(EXCEPTIONS.POLICY_BLOCKED.message, exceptionErrorCode || EXCEPTIONS.POLICY_BLOCKED.code, validationRslt);
    }
}
