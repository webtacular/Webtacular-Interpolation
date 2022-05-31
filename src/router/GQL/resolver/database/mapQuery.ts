//
//
// This here file is used to map the Schema to the database.
// As the schema might contain a value 'id' but the value 
// being stored in the database is '_id', we need to map
// the Schema so that 'id' is mapped to '_id'. etc.
//
//

import { mongoResponseObject } from './mongoDB';
import { projectionInterface } from './parseQuery';

import schemaObject from '../../../../lexer/types/objects/object';
import schemaValue from '../../../../lexer/types/value';

import { merge } from '../../../../merge';

function mapQuery(query: any, root: schemaObject.init): mongoResponseObject {
    // Start building the query
    let processedQuery: projectionInterface = {};

    // walk through the query, creating a path for each value
    // eg, { name: 'John', test: { a: 'b' }} will create a path for each value
    // => ['name'], ['test', 'a']
    function walk(query: any, path: Array<string> = []) {
        for (let key in query) {

            if (typeof query[key] === 'object')
                walk(query[key], [...path, key]);

            else {
                const arrayPath = [...path, key];

                // Try and locate the path in the database map
                const value = root.databaseValueMap.has(arrayPath);

                console.log(value);
            }
        }
    }

    console.log(root.schemaValueMap);

    // Start walking the query
    walk(query);

    console.log(processedQuery);

    return processedQuery;
}

export default mapQuery;