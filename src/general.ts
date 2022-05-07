import { types } from "./types";

// this function turns a array into a object
export const arrayToObject = (arr: Array<string>, val: types.basicUnion | types.obj = 1): types.obj => {
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

export const internalConfiguration = {
    // The defualt name for the values in a collection
    defaultValueName: 'items',
}