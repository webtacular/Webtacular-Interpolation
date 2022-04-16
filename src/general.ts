import _ from "lodash";

// this function turns a array into a object
export const arrayToObject = (arr: Array<string>, val: any = 1): {
    [key: string]: number | {}
} => {
    const lastValue = arr[arr.length - 1];

    return [...arr.slice(0, arr.length - 1), null].reduceRight((obj: { [key: string]: number | {} }, next: string): { [key: string]: number | {} } => {
        if (next === null) return { [lastValue]: val };
        return { [next]: obj };
    }, {});
}
