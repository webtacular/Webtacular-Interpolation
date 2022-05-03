//
//
// This here file is used to map the Schema to the database.
// As the schema might contain a value 'id' but the value 
// being stored in the database is '_id', we need to map
// the Schema so that 'id' is mapped to '_id'. etc.
//
//

import _ from 'lodash';

import { ObjectId } from 'mongodb';
import { mongoResponseObject } from './mongo';
import { arrayToObject } from '../../../general';
import { projectionInterface } from './parseQuery';

import schemaObject from '../../../query/object';
import schemaValue from '../../../query/value';

export default (queryArguments: any, input: schemaObject.init): mongoResponseObject => {
    // Start building the query
    let query: projectionInterface = {};

    // Map the requested resouces
    for(const paramater in queryArguments) {
        
        // Get the value
        let schemaParamater = input.obj[paramater] as schemaValue.init,
            // Input value from the user
            inputValue = queryArguments[paramater];


        // Custom cases if we need to do something special, like ID,
        // You must supply mongoDB with a ObjectId object for it to work
        switch(schemaParamater?.options?.type) {
            // Check if the paramater is of type 'id
            case 'id': {
                // Check if its a valid ObjectId
                if(ObjectId.isValid(inputValue) === true)
                    // If so, convert it to an ObjectId
                    inputValue = new ObjectId(inputValue);

                break;
            }

            default:
                continue;
        }  

        // Construct the query
        const object = arrayToObject(
            schemaParamater?.maskArray ?? [] as string[], 
            inputValue
        );

        // Merge the query
        _.merge(query, object);
    }

    return query;
}