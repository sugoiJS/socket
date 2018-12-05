import {IExceptionConstant,EXCEPTIONS as CoreExceptions} from "@sugoi/core";

export const EXCEPTIONS: { [prop: string]: IExceptionConstant } = {
    "BREAK_MIDDLEWARE": {code:7777,message:"pass"},
    "POLICY_BLOCKED": CoreExceptions.POLICY_BLOCKED
};