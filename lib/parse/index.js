"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Group = void 0;
const lodash_1 = __importDefault(require("lodash"));
const general_1 = require("../general");
const object_1 = __importDefault(require("../object"));
const value_1 = __importDefault(require("../value"));
const types_1 = require("../value/src/types");
class Group {
    constructor(name, schema) {
        this.name = name;
        this.schema = schema;
    }
}
exports.Group = Group;
const func = (Obj) => {
    var _a, _b;
    let opts = {
        uniqueValue: true,
        uniqueValues: [],
        searchable: (_b = (_a = Obj.options) === null || _a === void 0 ? void 0 : _a.searchable) !== null && _b !== void 0 ? _b : false,
    };
    let graphQL = {
        root: {},
        filter: [],
        unique: [],
        origin: Obj
    };
    const recurse = (obj, parentNames = []) => {
        for (const key in obj) {
            const value = obj[key];
            if (value instanceof value_1.default.init) {
                // Check if we have a unique value
                // This is important as if the schemaObject
                // is a collection, It needs to have a unique
                // value to be able to be queried.
                if (value.options.unique) {
                    opts.uniqueValue = true;
                    // Push the value to the uniqueValues array
                    opts.uniqueValues.push(value);
                }
                // Check if the Type is valid
                if (!types_1.TypeMap[value.options.type])
                    throw new Error(`Invalid Type: ${value.options.type}`);
                // Set the name of the value
                value.setKey(key);
                // Set the maskArray
                value.setObjectMaskArray([Obj.options.key, ...parentNames, key]);
                // Set the maskObject
                value.setObjectMaskObject((0, general_1.arrayToObject)(value.maskArray));
                // Check if value options contain a mask
                if (value.options.mask)
                    value.setMask(value.options.mask);
                // If not, generate a mask based on the schemaObject
                else
                    value.setMask((0, general_1.arrayToObject)([...parentNames, key]));
                // ----[ Root ]---- //
                // Merge the object
                lodash_1.default.merge(graphQL.root, [...parentNames, null].reduceRight((obj, next) => {
                    var _a;
                    if (next === null) {
                        // Format the type to fit the schema
                        let formatedType = types_1.TypeMap[value.options.type].gql + (((_a = value.options) === null || _a === void 0 ? void 0 : _a.unique) ? '!' : '');
                        // Check if the value is an array
                        if (value.options.array === true)
                            formatedType = `[${formatedType}]`;
                        // Finally return the object
                        return {
                            [key]: formatedType,
                            [key + 'Description']: 'Boolean',
                            [key + 'IsUnique']: 'Boolean',
                        };
                    }
                    else
                        return ({ [next]: obj });
                }, {}));
                // ----[ Collection ]---- //
                Object.keys(types_1.TypeMap[value.options.type].filter).forEach(keyFilter => {
                    const func = types_1.TypeMap[value.options.type].filter[keyFilter];
                    const returnable = {
                        func: func.func,
                        // Funky way to get the input type, but it works, and i cant be arsed to think of a better way
                        input: types_1.TypeMap[types_1.TypeMap[value.options.type].filter[keyFilter].input].gql,
                        data: value.options.type,
                        name: key + keyFilter
                    };
                    graphQL.filter.push(returnable);
                });
            }
            // If the value is an schemaObject, recurse
            if (value instanceof object_1.default.init)
                recurse(value.obj, [...parentNames, key]);
        }
    };
    // [ Entry ] //
    recurse(Obj.obj);
    // Check if this schemaObject is a searchable collection
    if (opts.searchable === true)
        // And check if we have the required unique values
        if (opts.uniqueValue === false)
            throw new Error('Searchable schemaObjects must have a unique value');
    // Loop through all the unique values
    opts.uniqueValues.forEach(value => {
        graphQL.unique.push(value);
    });
    // Return the graphQL object
    return graphQL;
};
exports.default = func;
//# sourceMappingURL=index.js.map