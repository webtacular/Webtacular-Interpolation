"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.arrayToObject = void 0;
// this function turns a array into a object
const arrayToObject = (arr) => {
    const lastValue = arr[arr.length - 1];
    return [...arr.slice(0, arr.length - 1), null].reduceRight((obj, next) => {
        if (next === null)
            return { [lastValue]: 1 };
        return { [next]: obj };
    }, {});
};
exports.arrayToObject = arrayToObject;
//# sourceMappingURL=general.js.map