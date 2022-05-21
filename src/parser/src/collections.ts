import schemaNested from "../types/objects/nested";
import schemaObject from "../types/objects/object";

function collectionize(object: schemaObject.init | schemaNested.init): void {
    // Set the collectionize fields
    object.collectionize = true;

    // get the collection field names
    const collectionizeFields = object.options?.collectionizeFields;

    // Check if the user has provided a collection name
    const collectionName = collectionizeFields?.collectionName ?? object.key + 'Collection',
        individualName = collectionizeFields?.individualName ?? object.key;

    // Check if both match 
    if(collectionName === individualName) // Crash
        throw new Error(`The collection name and individual name are the same.`);

    // Set the collectionize fields
    object.collectionizeFields = {
        schema: {
            collectionName: 'collection',
            individualName: 'individual'
        },

        types: {
            collectionName,
            individualName
        }
    };
}

export default collectionize;