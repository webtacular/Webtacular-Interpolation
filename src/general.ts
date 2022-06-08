import HookFunction from './accessControl/hook';
import schemaValue from './lexer/types/value';
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
        defualtGroupHooks: boolean;
    },
    debug: boolean;
    page: {
        maxSize: number;
        defaultSize: number;
    },
    casing: types.casing;
}

export function formatValue(value: Array<string | number> | string, casing: types.casing = internalConfiguration.casing): string {
    const arr: Array<string> = Array.isArray(value) ? value.map((val: string | number) => val.toString()) : [value];

    switch (casing) {
        case 'camel':
            return arr.map((val: string, index: number) => {
                if (index === 0) return val.toLowerCase();
                return val.charAt(0).toUpperCase() + val.slice(1).toLowerCase();
            }).join('');

        case 'pascal':
            return arr.map((val: string) => val.charAt(0).toUpperCase() + val.slice(1).toLowerCase()).join('');

        case 'snake':
            return arr.map((val: string) => val.toLowerCase()).join('_');

        case 'kebab':
            return arr.map((val: string) => val.toLowerCase()).join('-');
    }
}

export function convertType(type: schemaValue.type, array: boolean = false): schemaValue.GqlType {
    let newType: schemaValue.GqlType;

    switch(type) {
        case 'string': newType = 'String'; break;
        case 'number': newType = 'Int'; break;
        case 'float': newType = 'Float'; break;
        case 'boolean': newType = 'Boolean'; break;
        case 'id': newType = 'ID'; break;
    }

    return array ? (`[${newType}]` as schemaValue.GqlType) : newType;
}

export const internalConfiguration: internalConfiguration = {
    // The defualt name for the values in a collection
    defaultValueName: 'items',
    hooks: {
        defualtAccessControl: 'allow',
        defaultExecution: 'preRequest',
        defualtGroupHooks: true
    },
    debug: false,
    page: {
        maxSize: 15,
        defaultSize: 10,
    },
    casing: 'camel',
}

