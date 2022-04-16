"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("../value/src/types");
const object2gql_1 = require("./src/object2gql");
const object2gql_2 = __importDefault(require("./src/object2gql"));
exports.default = (input) => {
    // Check if searchable is enabled
    const opts = {
        collectionize: input.origin.options.searchable
    };
    // Store the unique values
    let unique = {};
    // Loop through all the unique values
    input.unique.forEach(value => unique[value.key] = types_1.TypeMap[value.options.type].gql + '!');
    // Convert the root into a string
    const root = (0, object2gql_2.default)(input.root, input.origin.options.key, 'interface');
    // We need to reformat the Filter object, as
    // It is not a valid GraphQL object.
    let filterObject = {};
    // Loop through the filter
    input.filter.forEach((filterCur, val) => filterObject[filterCur.name] = filterCur.input);
    // Convert the filter Object into gql
    const filter = (0, object2gql_2.default)(filterObject, input.origin.options.key + 'Filter', 'input');
    // Create the Collection
    let collectionObject = {
        total: 'Int',
        max: 'Int',
        items: `[${input.origin.options.key}]`,
    };
    // Create the Collection with the filter
    const collection = (0, object2gql_2.default)(collectionObject, input.origin.options.key + 'Collection', 'interface');
    // Create a query object
    const queryObject = {
        [input.origin.options.key]: new object2gql_1.InputClass(unique, input.origin.options.key),
        [input.origin.options.key + 'Collection']: new object2gql_1.InputClass({
            filter: `${input.origin.options.key}Filter`,
        }, `${input.origin.options.key + 'Collection'}`),
    };
    const query = (0, object2gql_2.default)(queryObject, `${input.origin.options.key}Query`, 'type');
    return {
        schema: `${root}\n${filter}\n${collection}\n${query}`,
        type: `${input.origin.options.key}Query`,
    };
};
//# sourceMappingURL=index.js.map