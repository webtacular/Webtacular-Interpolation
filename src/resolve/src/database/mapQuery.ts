import { MongoResponseObject } from "./interface";
import { ObjectId } from "mongodb";

import _ from "lodash";
import { arrayToObject } from "../../../general";
import SchemaObject from "../../../query/object";
import { ProjectionInterface } from "./parseQuery";

export default (queryArguments: any, input: SchemaObject.init): MongoResponseObject => {
    // Start building the projection
    let projection: ProjectionInterface = {};

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
 
        // Construct the projection
        const object = arrayToObject(
            schemaParamater.maskArray, 
            inputValue
        );

        // Merge the projection
        _.merge(projection, object);
    }

    return projection;
}