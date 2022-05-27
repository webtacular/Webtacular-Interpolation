import { IProcessedValue } from "../../../lexer/index.interfaces";
import { merge } from "../../../merge";
import { IGql } from "./parse";

function leaf(leafs: { [x: string]: IProcessedValue }): IGql {
    // Object to store the output in
    let gql: IGql = {};

    // Branch keys
    const leafKeys = Object.keys(leafs);

    // Loop trough all keys
    for(let i: number = 0; i < leafKeys.length; i++) {
        // Get the current key
        const key: string = leafKeys[i],
            leaf = leafs[key];

        // Parent of the leaf
        const parent = leaf.parent.get();

        // Temporary object to store the processed values
        let temporaryReturnable: IGql = {};

        // Leaf values keys
        const leafValuesKeys = Object.keys(leaf.values);

        // Loop trough the values
        for(let i: number = 0; i < leafValuesKeys.length; i++) {
            const leafKey = leafValuesKeys[i],
                leafValue = leaf.values[leafKey];

            // Add the value to the temporary returnable
            merge(temporaryReturnable, {
                [leafValue.key]: leafValue.type
            });
        }

        // Nested value keys
        const nestedValuesKeys = Object.keys(leaf.nested);

        // Loop trough the nested values
        for(let i: number = 0; i < nestedValuesKeys.length; i++) {
            const nestedKey = nestedValuesKeys[i],
                nestedValue = leaf.nested[nestedKey];

            // Get the nested object
            const nested = nestedValue.get();

            // Temporary key to store the key name
            let temporaryKey: string = nested.key;

            // Check if the nested object is a collection
            if(nested.collectionize === true)
                temporaryKey = nested.root;

            // Check if the nested object is an array
            if(nested.array === true)
                temporaryKey = `[${temporaryKey}]`;

            // Add the value to the temporary returnable
            merge(temporaryReturnable, {
                [nestedKey]: temporaryKey
            });
        }

        // merge the final returnable
        merge(gql, {
            [parent.key]: temporaryReturnable
        });
    }
    
    // Finally, return the gql
    return gql;
}

export default leaf;