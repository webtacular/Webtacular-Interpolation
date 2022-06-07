import { types } from '../../../../../types';

import { merge } from '../../../../../merge';
import { mongoResponseObject } from './main';
import { projectionInterface } from '../parseQuery';

import schemaObject from '../../../../../lexer/types/objects/object';

function mapQuery(query: types.GQLinput, root: schemaObject.init): mongoResponseObject {
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
                // Get the path of this value
                const arrayPath = [...path, key].join('');

                // Try and locate the path in the database map
                const value = root.schemaValueMap[arrayPath];

                // Merge the value into the returnable
                if(value) merge(processedQuery, value().mask.database.mask);
            }
        }

        return processedQuery;
    }

    return walk(query);
}

export default mapQuery;