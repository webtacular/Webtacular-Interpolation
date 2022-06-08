import { ObjectId } from "mongodb";
import { merge } from "../merge";

import schemaObject from "./types/objects/object";
import schemaValue from "./types/value";
import schemaNested from "./types/objects/nested";
import baseObject from "./types/objects/base";

import { IHookBank, INestedValues, IOutput, IProcessedObject, IProcessedValue } from "./index.interfaces";
import generateFilters from "./filters";

function parse(object: schemaObject.init): IOutput {
    let returnable: IProcessedObject = { nested: {}, values: {}, object: {} };
    let hookBank: IHookBank = {};

    let clearObjectArr: Array<() => void> = [];
    let verifyObjectArr: Array<() => void> = [];

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
            // Set the key 
            schema.setKey(schema.options.name);

            // Push the clear function to the array
            clearObjectArr.push(() => schema.clearObject());

            // Push the verify function to the array
            verifyObjectArr.push(() => schema.verifyObject());
            
            // colectionize the object
            schema.collectionizeObject();

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
            let nestedValues: INestedValues = {};

            // Loop trough the values
            for(let i: number = 0; i < objKeys.length; i++) {

                // ------------------------------[ Nested ]---------------------------- //
                if(schema[objKeys[i]] instanceof schemaNested.init) {

                    // Get the nested object
                    const value = schema[objKeys[i]] as schemaNested.init;

                    // set the value key
                    value.setKey(objKeys[i]);
                    
                    // Set the parents
                    value.setParents(parents);

                    // Set the key name
                    value.collectionizeObject(objKeys[i]);

                    // Add self to the nested Values object
                    nestedValues[value.key] = { identifier: value.identifier, get: () => value }

                    // Merge the returnable
                    merge(returnable.nested, { [value.identifier.toString()]: value });

                    // Push the clear function to the array
                    clearObjectArr.push(() => value.clearObject());

                    // Push the verify function to the array
                    verifyObjectArr.push(() => value.verifyObject());

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

                // Set the value key
                value.key = key;

                // Process the value
                value.additonalValues();
                value.setParent({
                    identifier: currentParent,
                    get: () => parents[parents.length - 1]
                });
                value.generateMask(parents[parents.length - 1].mask);
                value.map(parents[0]);
                value.groupHooks(hookBank);


                // ----------------------------[ Filter ]---------------------------- //
                const filters = generateFilters(value.key, value.type);

                value.filters = filters;
                parents[parents.length - 1].filters.push(...filters);


                // --------------------------[ Returnable ]-------------------------- //
                merge(temporaryReturnable, {
                    [key]: value
                });

                
            }

            // Generate the unique id for this value collection
            const valuesID = parents[parents.length - 1].identifier;

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
                } as IProcessedValue
            });

            parents[parents.length - 1].childGetter = () => returnable.values[valuesID.toString()];
        }
    }

    // Walk through the object
    walk(object);

    // This is done for memory reasons,
    // as we don't want to keep 375634567 
    // redundant objects in memory
    clearObjectArr.forEach(func => func());

    // Verify the objects
    verifyObjectArr.forEach(func => func());

    return {
        processed: returnable,
        hookBank
    }
}

export default parse;