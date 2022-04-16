// This here module is responsible for parsing the request and
// Returning the correct data.

import _ from "lodash";
import { ObjectId } from "mongodb";
import { arrayToObject } from "../../../general";
import SchemaObject from "../../../query/object";
import SchemaValue from "../../../query/value";

import MongoService from '../database'

const resolve = async (
    uniqueValues: SchemaValue.init[],
    input:  SchemaObject.init,

    queryFilter: any,
    queryArguments: any,

    client: MongoService
) => {
    const collection = client.getCollection(input.options.databaseName, input.options.collectionName);

    // Start building the projection
    let projection = {};
    
    // Map the requested resouces
    for(const paramater in queryFilter[input.options.key]){
        // Get the value
        const value = input.obj[paramater];

        // If somehows the paramater is not found in the schema
        // Then we can't resolve it
        if(!value) continue;

        // Merge the filters
        _.merge(projection, value.mask);
    }

    // Start building the filter
    let filter = {};

    // Map the requested resouces
    for(const paramater in queryArguments[input.options.key]){
        // Get the value
        let schemaParamater = input.obj[paramater],
            inputValue = queryArguments[input.options.key][paramater];

        switch(paramater) {

            // Check if the paramater is of type 'id
            case 'id': {
                // Check if its a valid ObjectId
                if(ObjectId.isValid(inputValue))
                    // If so, convert it to an ObjectId
                    inputValue = new ObjectId(inputValue);

                break;
            }
        }

        _.merge(filter, arrayToObject(schemaParamater.maskArray, new ObjectId(queryArguments[input.options.key][paramater])));
    }

    // Use the filter to get the data
    const data = await collection.aggregate([
        { $project: projection },
        { $match: filter }
    ]).toArray();

    if(data.length === 0) return undefined;

    // Map the requested resouces back to the schema
    return data[0]
}

export default resolve;