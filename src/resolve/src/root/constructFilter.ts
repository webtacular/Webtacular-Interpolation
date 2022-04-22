import { MongoResponseObject } from "../database/interface";
import { ObjectId } from "mongodb";

import _ from "lodash";
import { arrayToObject } from "../../../general";
import SchemaObject from "../../../query/object";

export default (queryArguments: any, input: SchemaObject.init): MongoResponseObject => {
    // Start building the filter
    let filter = {};

    // Map the requested resouces
    for(const paramater in queryArguments[input.options.key]){
        // Get the value
        let schemaParamater = input.obj[paramater],
            // Input value from the user
            inputValue = queryArguments[input.options.key][paramater];

        // Custom cases if we need to do something special, like ID,
        // You must supply mongoDB with a ObjectId object for it to work
        switch(paramater) {
            // Check if the paramater is of type 'id
            case 'id': {
                // Check if its a valid ObjectId
                if(ObjectId.isValid(inputValue) === true)
                    // If so, convert it to an ObjectId
                    inputValue = new ObjectId(inputValue);

                break;
            }
        }  
 
        // Construct the filter
        const object = arrayToObject(
            schemaParamater.maskArray, 
            inputValue
        );

        // Merge the filter
        _.merge(filter, object);
    }

    return filter;
}