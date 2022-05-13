//
//
// This here file is the opposite of mapQuery.ts, it is used to map the database to the Schema.
// As the database might contain a value '_id', but the value in the Schema is 'id', we need to map
// '_id' to 'id'. etc.
//
//

import schemaObject from '../../../parser/types/object';


import { mongoResponseObject } from './mongoDB';
import { arrayToObject } from '../../../general';
import { merge } from '../../../merge';

export default function (input: schemaObject.init, data: mongoResponseObject): mongoResponseObject {
    // Walk through the data object, get the according value from the schema
    // and map it to the data object
    let obj: mongoResponseObject = {};

    const walk = (data: any, schema: any, parentName: string[] = []) => {
        for (const key in schema) {
            const value = schema[key];

            if (value instanceof schemaObject.init)
                walk(data[key], value.obj, [...parentName, key]);

            else {
                // Find the value in the schema
                const schemaValue = schema[key];

                // Using the maskArray, find the value in the data
                const dataValue = (schemaValue.maskArray as string[]).reduce((acc, curr) => acc[curr], data);

                // If no value is found, then we can't resolve it
                if (dataValue === undefined) continue;

                // If the value is found, then we can map it to the schema
                const reMaped = arrayToObject(
                    [...parentName, schemaValue.key], 
                    dataValue
                );

                // Merge the reMaped object to the obj
                obj = merge(obj, reMaped);
            }
        }
    }

    // Walk through the data object, get the according value from the schema
    walk(data, input.obj);

    // Return the mapped object
    return obj;
}