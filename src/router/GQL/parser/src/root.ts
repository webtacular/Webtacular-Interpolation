import schemaNested from "../../../../lexer/types/objects/nested";
import schemaObject from "../../../../lexer/types/objects/object";

import { merge } from "../../../../merge";
import { formatValue } from "../../../../general";
import { IGraphQL, GQLinput, GQLvalue, IStringObject } from "./types";


function root(roots: { [x: string]: schemaObject.init | schemaNested.init}): IGraphQL {
    // Temporary object to store the output in
    let gql: IGraphQL = {};
    
    const rootKeys = Object.keys(roots);

    // Loop trough all keys
    for(let i: number = 0; i < rootKeys.length; i++) {
        // Get the key and the value
        const key: string = rootKeys[i],
            value = roots[key];
            
        // Switch on collectionize
        switch(value.collectionize) {
            case true:
                // Temporary object to store the processed values
                let temporaryReturnable: IGraphQL = {};

                // ----------------- [ Individual Root ] ----------------- //
                const schema = value.collectionizeFields.schema;

                // Create an object to store the unique values in
                let uniqueObject: IStringObject = {};

                // Loop trough the values
                value.uniqueValues.forEach((uniqueGetter) => {
                    // Get the value
                    const uniqueValue = uniqueGetter.get();

                    // set the value as required
                    uniqueObject[uniqueValue.key] = new GQLvalue({ 
                        type: uniqueValue.type, 
                        required: true 
                    });
                });

                // Generate the individual getter
                const individualInput = new GQLinput(
                    uniqueObject, 
                    {
                        name: 'filter',
                        type: formatValue([value.key, schema.individualName, 'filter']),
                        return: value.key
                    }
                );


                // ----------------- [ Collection Root ] ----------------- //

                // Create the filter object
                let filterObject: IStringObject = {}

                value.filters.forEach((filter) => {
                    merge(filterObject, {
                        [filter.name]: filter.type
                    });
                });

                // Collection Input
                const collectionInput = new GQLinput(
                    filterObject, 
                    {
                        name: 'filter', 
                        type: formatValue([value.key, value.collectionizeFields.schema.collectionName, 'filter']),
                        return: `[${value.key}]`
                    },
                    {
                        required: true
                    }
                );

            
                // Collection root
                merge(temporaryReturnable, {
                    [value.collectionizeFields.types.collectionName]: {
                        items: collectionInput,
                        total: 'Int',
                        size: 'Int',
                        page: 'Int',
                        pages: 'Int',
                        max: 'Int'
                    }
                });
                

                
                // Add the temporary returnable to the gql
                merge(gql, merge(temporaryReturnable, {
                    [value.root]: {
                        // Individual getter
                        [schema.individualName]: individualInput,
                        
                        // reference to the collection
                        [schema.collectionName]: value.collectionizeFields.types.collectionName
                    }
                }));
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