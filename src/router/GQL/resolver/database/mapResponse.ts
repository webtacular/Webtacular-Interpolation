//
//
// This here file is the opposite of mapQuery.ts, it is used to map the database to the Schema.
// As the database might contain a value '_id', but the value in the Schema is 'id', we need to map
// '_id' to 'id'. etc.
//
//

import schemaObject from '../../../../lexer/types/objects/object';


import { mongoResponseObject } from './mongoDB';
import { arrayToObject } from '../../../../general';
import { merge } from '../../../../merge';
import { IProcessedValue } from '../../../../lexer/index.interfaces';

export default function (input: schemaObject.init, data: mongoResponseObject): mongoResponseObject {
    // Walk through the data object, get the according value from the schema
    // and map it to the data object
    let obj: mongoResponseObject = {};

    function walk(data: any, children: IProcessedValue) {
        for (let key in data) {
            
            console.log(key);
        }
    }

    // Walk through the data object, get the according value from the schema
    walk(data, input.childGetter());

    // Return the mapped object
    return obj;
}