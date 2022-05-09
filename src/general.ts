import _ from 'lodash';
import HookFunction from './accessControl/hook';
import { types } from "./types";

// this function turns a array into a object
export function arrayToObject(arr: Array<string>, val: types.anyType = 1): {
    [key: string]: number | {}
} {
    class endStop {
        endVal: string;
        constructor(val: string) {
            this.endVal = val;
        }
    }

    const lastValue: endStop = new endStop(arr[arr.length - 1]);

    arr.pop();

    const returnable: types.obj = [...arr, lastValue].reduceRight((obj: types.obj, next: string): types.obj => {

        if (lastValue instanceof endStop) return ({ [lastValue.endVal]: val });

        return { [next]: obj };

    }, {});

    return returnable;
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

