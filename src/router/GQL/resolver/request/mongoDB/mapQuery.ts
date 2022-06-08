
import schemaObject from '../../../../../lexer/types/objects/object';

import { merge } from '../../../../../merge';
import { types } from '../../../../../types';
import { IHookReference } from '../../../../../lexer/index.interfaces';
import { projectionInterface } from '../parseQuery';

export interface IMapQuerySharedExport {
    mask: projectionInterface;
    hooks: IHookReference[];
}

function mapQuery(query: types.GQLinput, root: schemaObject.init): IMapQuerySharedExport {
    // Start building the query
    let processedQuery: projectionInterface = {};
    let hookRefs: IHookReference[] = [];

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
                const valueGetter = root.schemaValueMap[arrayPath];

                // Merge the value into the returnable
                if(valueGetter) {

                    // get the value
                    const value = valueGetter();

                    // Merge the mask into the returnable
                    merge(processedQuery, value.mask.database.mask);

                    // Add the hook reference
                    hookRefs = [...hookRefs, ...value.hooks];
                }
            }
        }

        return {
            mask: processedQuery,
            hooks: hookRefs
        };
    }

    return walk(query);
}

export default mapQuery;