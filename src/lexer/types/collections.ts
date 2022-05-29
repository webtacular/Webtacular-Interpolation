import baseObject from "./objects/base";

function collectionize(object: baseObject.init): void {

    // Set the collectionize fields
    object.collectionize = true;

    // get the collection field names
    const collectionizeFields = object.options?.collectionizeFields;

    // Check if the user has provided a collection name
    const name = collectionizeFields?.name ?? object.key + 'Collection',
        individualName = collectionizeFields?.individualName ?? object.key + 'Individual';

    // Check if both match 
    if(name === individualName) // Crash
        throw new Error(`The collection name and individual name are the same.`);

    // Set the collectionize fields
    object.collectionizeFields = {
        schema: {
            name: 'collection',
            individualName: 'individual'
        },

        types: {
            name,
            individualName
        }
    };
}

export default collectionize;