"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
exports.default = (context) => {
    let filter = {};
    let args = {};
    const recurse = (selection, parentName = []) => {
        var _a;
        for (const newSelection in Object.keys(selection)) {
            // Current selection
            const current = selection[newSelection];
            // If the current selection is a field
            if ((current === null || current === void 0 ? void 0 : current.kind) === 'Field') {
                // If the current selection name is not null
                if (current.name === null)
                    continue;
                // If the parent name is not undefined
                if (parentName[0] !== undefined) {
                    // turn tje parentName array into an object
                    // eg [ 'hello', 'other' ], name => { hello: other: { name: 1 } }
                    lodash_1.default.merge(filter, [...parentName, null].reduceRight((obj, next) => {
                        if (next === null)
                            return ({ [current.name.value]: 1 });
                        return ({ [next]: obj });
                    }, {}));
                }
                // If the parent name is null,
                // then merge the filter with the current selection
                else {
                    lodash_1.default.merge(filter, { [current.name.value]: 1 });
                    // if(current?.arguments) { 
                    //     _.merge(args, {[current.name.value]: 1});
                    // }
                }
                lodash_1.default.merge(args, [...parentName, null].reduceRight((obj, next) => {
                    var _a;
                    if (next === null) {
                        let returnable = {};
                        for (const argument of current.arguments) {
                            if ((_a = argument.value) === null || _a === void 0 ? void 0 : _a.fields)
                                for (const field of argument.value.fields) {
                                    returnable[field.name.value] = field.value.value;
                                }
                            else
                                returnable[argument.name.value] = argument.value.value;
                        }
                        if (Object.keys(returnable).length > 0)
                            return { [current.name.value]: returnable };
                        else
                            return {};
                    }
                    return ({ [next]: obj });
                }, {}));
            }
            // If the current selection is an array, we need to recurse
            if ((_a = current === null || current === void 0 ? void 0 : current.selectionSet) === null || _a === void 0 ? void 0 : _a.selections)
                recurse(current.selectionSet.selections, [...parentName, current.name.value]);
        }
    };
    // Start the recursive function
    recurse(context.operation.selectionSet.selections);
    // Finally return the filter
    return {
        filter,
        arguments: args
    };
};
//# sourceMappingURL=filter.js.map