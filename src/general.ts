import _ from "lodash";

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

export let internalConfiguration = {
    // The defualt name for the values in a collection
    defaultValueName: 'value',
}