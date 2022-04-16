import { Output } from '../parse';
import { TypeMap } from "../value/src/types";
import { InputClass } from "./src/object2gql";

import object2gql from "./src/object2gql";
import SchemaObject from '../object';

export default (input: Output): {
    schema: string;
    type: string;
    orgin: SchemaObject.init;
} => {
    // Check if searchable is enabled
    const opts: { [key: string]: boolean } = {
        collectionize: input.origin.options.collectionize ?? false,
        hasUnique:  input.unique.length > 0,
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
    input.filter.forEach((filterCur) => 
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
    let collection: string = '';

    // Create a query object
    let queryObject: { [key: string]: string | InputClass } = {}

    // If the collectionize option is enabled
    if(opts.collectionize === true) {
        Object.assign(queryObject, { 
            [input.origin.options.key + 'Collection']: new InputClass({
                filter: `${input.origin.options.key}Filter`,
            }, `${input.origin.options.key + 'Collection'}`,)
        });

        collection = object2gql(collectionObject, input.origin.options.key + 'Collection', 'type') + '\n';
    }

    // If a unique value is present
    if(opts.hasUnique === true) {
        Object.assign(queryObject, {
            [input.origin.options.key]: new InputClass(unique, input.origin.options.key)
        })
    }

    // Construct the final schema
    const query = object2gql(queryObject, `${input.origin.options.key}Query`, 'type');

    // Return the final schema
    return {
        schema: `${root}\n${filter}\n${collection}${query}`,
        type: `${input.origin.options.key}Query`,
        orgin: input.origin
    }
} 