import { groupHooks, groupHooksInterface } from "../accessControl/groupHooks";
import { arrayToObject } from "../general";
import { ObjectId } from "mongodb";
import { merge } from "../merge";

import schemaObject from "./types/objects/object";
import HookFunction from "../accessControl/hook";
import schemaValue from "./types/value";
import schemaNested from "./types/objects/nested";
import baseObject from "./types/objects/base";

export interface Reference {
    identifier: ObjectId;
    get: () => schemaNested.init | processedObject | schemaObject.init;
}

export interface valueReference {
    identifier: ObjectId;
    get: () => schemaValue.init;
}

export interface hookReference {
    identifier: ObjectId;
    get: () => groupHooksInterface;
}

export interface NestedValuesInterface {
    [key: string]: Reference
}

export interface processedObject {
    identifier: ObjectId;
    parent: Reference;
    nested: NestedValuesInterface;
    values: Array<schemaValue.init>;
}

export interface hookBankInterface {
    [x: string]: groupHooksInterface;
}

export interface ProcessedObjectInterface {
    nested: { [x: string]: schemaNested.init };
    values: { [x: string]: processedObject };
    object: { [x: string]: schemaObject.init };
}

export interface Output {
    processed: ProcessedObjectInterface;
    hookBank: hookBankInterface;
}

export function parse(object: schemaObject.init): Output {
    let returnable: ProcessedObjectInterface = { nested: {}, values: {}, object: {} };
    let hookBank: hookBankInterface = {};
    let clearObjectArr: Array<() => void> = [];

    const walk = (
        schema: schemaObject.init | baseObject.ValueInterface,
        parents: Array<schemaObject.init | schemaNested.init> = [],
        currentParent: ObjectId = new ObjectId(),
        parentsId: Array<string> = [],
        parentsKeys: Array<string> = []): void => 
    {

        // ---------------------------------[ Object ]--------------------------------- //
        // Recurse through the schema if the schema
        // an instance of schemaObject.init
        if(schema instanceof schemaObject.init) {
            // Push the clear function to the array
            clearObjectArr.push(() => schema.clearObject());

            merge(returnable.object, {
                [schema.identifier.toString()]: schema
            });

            // Recurse
            walk(
                schema.obj, 
                [...parents, schema], 
                schema.identifier,
                [...parentsId, schema.identifier.toString()],
                [...parentsKeys, schema.options.name]
            );
        } 
        
        // ----------------------------------[ Value ]--------------------------------- //
        else {
            
            const objKeys: string[] = Object.keys(schema);

            // Temporary object to store the processed values
            let temporaryReturnable: any = {};

            // Nested values
            let nestedValues: NestedValuesInterface = {};

            // Loop trough the values
            for(let i: number = 0; i < objKeys.length; i++) {

                // ------------------------------[ Nested ]---------------------------- //
                if(schema[objKeys[i]] instanceof schemaNested.init) {

                    // Get the nested object
                    const value = schema[objKeys[i]] as schemaNested.init;
                    
                    // Set the parents
                    for(let j: number = 0; j < parents.length; j++) {
                        // Set the parent
                        value.parents.push({
                            identifier: parents[j].identifier,
                            get: () => parents[j]
                        });

                        // If we are at the last parent 
                        // Set the parent reference
                        if(j === parents.length - 1) value.parent = {
                            identifier: parents[j].identifier,
                            get: () => parents[j]
                        }
                    }

                    // Set the key name
                    value.collectionizeObject(objKeys[i]);

                    // Add self to the nested Values object
                    nestedValues[value.key] = {
                        identifier: value.identifier,
                        get: () => value
                    }

                    // Merge the returnable
                    merge(returnable.nested, {
                        [value.identifier.toString()]: value
                    });

                    // Push the clear function to the array
                    clearObjectArr.push(() => value.clearObject());

                    // Recurse
                    walk(
                        value.obj,
                        [...parents, value],
                        value.identifier,
                        [...parentsId, value.identifier.toString()],
                        [...parentsKeys, objKeys[i]]
                    );

                    // Stop the loop from progressing
                    continue;
                }

                // -----------------------------[ General ]---------------------------- //
                const key = objKeys[i],
                    value = schema[key] as schemaValue.init;


                    
                // -----------------------------[ Unique ]---------------------------- //
                // Check if we have a unique value
                if(value.options?.unique === true) {
                    value.options.unique = true;

                    //Push the value to the uniqueValues array
                    parents[parents.length - 1].uniqueValues.push({
                        identifier: value.identifier,
                        get: () => value
                    });
                } 



                // -----------------------------[ Mask ]----------------------------- //
                // We store two different types of masks in the schema
                // One is the mask passed to us by the user
                // The other is the mask that is generated by the system
                // It will be the mask used to get the data from the database

                //
                // Schema Mask
                //

                // set the mask array
                value.mask.schema.maskArray = [key];

                // set the mask key
                value.mask.schema.key = key;

                // set the mask object
                value.mask.schema.mask = arrayToObject(value.mask.schema.maskArray);

                //
                // Database Mask
                //
                if(value.options.mask) {
                    // We need to grab the furthest child in the object
                    const maskRecurse = (obj: {[x: string]: number | {}}, maskArray: Array<string> = []) => {
                        for (const key in obj) {
                            const value = obj[key];
                            maskArray.push(key);
                            if (value instanceof Object)
                                maskRecurse(value, maskArray);
                        }

                        return maskArray;
                    }

                    // generate the mask array
                    const maskArray = maskRecurse(value.options.mask);
                    
                    // Set the mask key
                    value.mask.database.key = maskArray[maskArray.length - 1];

                    // Set the mask array
                    value.mask.database.maskArray = maskArray

                    // set the schema object mask
                    value.mask.database.mask = arrayToObject(value.mask.database.maskArray);
                } 

                // If the user did not specify a mask, we can use the default mask
                else value.mask.database = value.mask.schema;

                // Set the values key
                value.key = value.mask.schema.key;

                // -----------------------[ Additional values ]----------------------- //
                // Values can have additional values that are not in the database
                // Such as if the value is unique, or its description
                // We can add these values to the value object

                // Check if we have a unique value
                if(value.options?.unique === true)
                    value.additionalValues.push({
                        key: `is${value.mask.schema.key}Unique`,
                        value: true
                });
            

                // Check if we have a description
                if(value.options?.description)
                    value.additionalValues.push({
                        key: `${value.mask.schema.key}Description`,
                        value: value.options.description
                });

                

                // -----------------------------[ Hooks ]----------------------------- //
                // As a form of optimization, we preprocess the hooks and group them.
                // This allows us to run the hooks in a single function for multiple values.
                // This is a lot faster than running the hooks individually, and
                // processing the hooks during the query.

                if(value.options.accessControl) {
                    // Initialize the access control function of this value
                    const hookObject = 
                        new HookFunction.init(value.options.accessControl);

                    // Group the hooks together
                    const grouped = 
                        groupHooks(hookBank, hookObject, value);

                    // set the hook bank
                    hookBank = grouped.hookBank;

                    // Generate the hook references
                    let hookReferences: Array<hookReference> = [];

                    // Loop through the hooks
                    for(let i: number = 0; i < grouped.hookIdentifiers.length; i++) {

                        // Add the hook reference to the array
                        hookReferences.push({
                            identifier: grouped.hookIdentifiers[i],
                            get: () => hookBank[grouped.hookIdentifiers[i].toString()]
                        });
                    }

                    // Set the hook references
                    value.hooks = hookReferences;
                }



                // --------------------------[ Returnable ]-------------------------- //
                merge(temporaryReturnable, {
                    [key]: value
                });

            }

            // Generate the unique id for this value collection
            const valuesID = new ObjectId();

            // merge the returnable with the returnable object
            merge(returnable.values, {
                [valuesID.toString()]: {
                    parent: {
                        identifier: parents[parents.length - 1].identifier,
                        get: () => parents[parents.length - 1]
                    },
                    identifier: valuesID,
                    values: temporaryReturnable,
                    nested: nestedValues,
                } as processedObject
            });
        }
    }

    walk(object);

    // Clear all the objects
    for(let i = 0; i < clearObjectArr.length; i++) {
        
        // This is done for memory reasons,
        // as we don't want to keep 375634567 
        // redundant objects in memory
        clearObjectArr[i]();
    }

    return {
        processed: returnable,
        hookBank
    }
}


const a = parse(new schemaObject.init({
    collectionName: 'config',
    databaseName: 'test',
    name: 'config',
    collectionize: true,
}, {
    id: new schemaValue.init({
        type: 'id',
        unique: true,

        mask: {
            schema: {  '_id': 1, }
        },
    }),

    abv: new schemaNested.init({
        collectionize: true,
    }, {
        idNested: new schemaValue.init({
            type: 'id',
            unique: true, 
        }),

        valueNested: new schemaValue.init({
            type: 'string',
        }),
    }),

    precedence: new schemaValue.init({
        type: 'id',
        array: true,
        unique: true,
        accessControl: (hook) => {
            hook('view', (req) => {
                return true;
            });
        }
    }),
}));

console.log(JSON.stringify(a.processed.values, null, 2), a.hookBank);