import { formatValue } from "../../../general";
import schemaNested from "../../../lexer/types/objects/nested";
import schemaObject from "../../../lexer/types/objects/object";

import { merge } from "../../../merge";
import { IGql, input, IStringObject } from "./parse";


function root(roots: { [x: string]: schemaObject.init | schemaNested.init}): IGql {
    let gql: IGql = {};
    
    const rootKeys = Object.keys(roots);

    for(let i: number = 0; i < rootKeys.length; i++) {
        const key: string = rootKeys[i],
            value = roots[key];
            
        // Switch on collectionize
        switch(value.collectionize) {
            case true:
                let temporaryReturnable: IGql = {};
                // If the value is collectionizeable
                // it will be structered as so
                // root: {
                //    individual: rootParent,
                //    collection: {
                //       items: [rootParent]
                //       total: number // Total amount of items returned
                //       size: number // The size of the current page
                //       page: number // What page to get
                //       pages: number // total / size
                //       max: number // Max ammount of items per page that a user can request
                //    }
                // }
                // We'll need 3 objects to store the data
                // 1. The Branch, 2. The individual root, 3. The collection root

                // Create the unique object
                let uniqueObject: IStringObject = {};

                value.uniqueValues.forEach((uniqueGetter) => {
                    const uniqueValue = uniqueGetter.get();

                    merge(uniqueObject, {
                        [uniqueValue.key]: uniqueValue.type
                    });
                });
                
                // Individual root
                merge(temporaryReturnable, {
                    [value.root]: {
                        [value.collectionizeFields.schema.individualName]: new input(uniqueObject, `[${value.key}]`, 'filter', formatValue([value.key, value.collectionizeFields.schema.individualName, 'filter'])),
                        [value.collectionizeFields.schema.collectionName]: value.collectionizeFields.types.collectionName
                    }
                });

                // Create the filter object
                let filterObject: IStringObject = {}

                value.filters.forEach((filter) => {
                    merge(filterObject, {
                        [filter.name]: filter.type
                    });
                });

                // Collection root
                merge(temporaryReturnable, {
                    [value.collectionizeFields.types.collectionName]: {
                        items: new input(filterObject, `[${value.key}]`, 'filter', formatValue([value.key, value.collectionizeFields.schema.collectionName, 'filter'])),
                        total: 'Int',
                        size: 'Int',
                        page: 'Int',
                        pages: 'Int',
                        max: 'Int'
                    }
                });
                
                // Add the temporary returnable to the gql
                merge(gql, temporaryReturnable);
                break;

            case false:
                // Is the value an array
                if(value.array === true) merge(gql, {
                    [value.key]: `[${value.key}]`
                });

                else merge(gql, {
                    [value.key]: value.key
                });
                break;
        }
    }

    return gql;
}

export default root;