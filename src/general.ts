import HookFunction from './accessControl/hook';
import { types } from "./types";

// this function turns a array into a object
export function arrayToObject(arr: Array<string>, val: types.anyType = 1): {
    [key: string]: number | {}
} {
    const lastValue: string = arr[arr.length - 1];

    return arr.reduceRight((obj: { [key: string]: number | {} }, next: string): { [key: string]: number | {} } => {
        if (next === lastValue) return ({ [next]: val });
        return { [next]: obj };
    }, {});
}

export interface internalConfiguration {
    defaultValueName: string;
    hooks: {
        defualtAccessControl: HookFunction.hookAccessControl;
        defaultExecution: HookFunction.hookExecution;
    },
    debug: boolean;
    page: {
        maxSize: number;
        defaultSize: number;
    }
}

export const internalConfiguration: internalConfiguration = {
    // The defualt name for the values in a collection
    defaultValueName: 'items',
    hooks: {
        defualtAccessControl: 'allow',
        defaultExecution: 'preRequest',
    },
    debug: false,
    page: {
        maxSize: 15,
        defaultSize: 10,
    }
}

