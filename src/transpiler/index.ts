import { Output } from "../parse";
import { TypeMap } from "../value/src/types";
import { InputClass } from "./src/object2gql";

import object2gql from "./src/object2gql";

export default (input: Output): {
    schema: string;
    type: string;
} => {
    // Check if searchable is enabled
    const opts = {
        collectionize: input.origin.options.searchable
    }

    // Store the unique values
    let unique: { [key: string]: string } = {};

    // Loop through all the unique values
    input.unique.forEach(value => 
        unique[value.key] = TypeMap[value.options.type].gql + '!');

    // Convert the root into a string
    const root = object2gql(input.root, 
        input.origin.options.key, 'type');

    // We need to reformat the Filter object, as
    // It is not a valid GraphQL object.
    let filterObject: { [key: string]: string } = {}

    // Loop through the filter
    input.filter.forEach((filterCur, val) => 
        filterObject[filterCur.name] = filterCur.input);

    // Convert the filter Object into gql
    const filter = object2gql(filterObject, 
        input.origin.options.key + 'Filter', 'input');
    
    // Create the Collection
    let collectionObject: { [key: string]: string } = {
        total: 'Int',
        max: 'Int',
        items: `[${input.origin.options.key}]`,
    };

    // Create the Collection with the filter
    const collection = object2gql(collectionObject, 
        input.origin.options.key + 'Collection', 'type');

    // Create a query object
    const queryObject: { [key: string]: string | InputClass } = {
        [input.origin.options.key]: new InputClass(unique, input.origin.options.key),

        [input.origin.options.key + 'Collection']: new InputClass({
            filter: `${input.origin.options.key}Filter`,
        }, `${input.origin.options.key + 'Collection'}`,),
    }

    const query = object2gql(queryObject, `${input.origin.options.key}Query`, 'type')

    return {
        schema: `${root}\n${filter}\n${collection}\n${query}`,
        type: `${input.origin.options.key}Query`,
    }
} 