import _ from 'lodash';
import HookFunction from './accessControl/hook';

// this function turns a array into a object
export const arrayToObject = (arr: Array<string>, val: any = 1): {
    [key: string]: number | {}
} => {
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
}

export const internalConfiguration: internalConfiguration = {
    // The defualt name for the values in a collection
    defaultValueName: 'items',
    hooks: {
        defualtAccessControl: 'allow',
        defaultExecution: 'preRequest',
    },
    debug: true,
}

