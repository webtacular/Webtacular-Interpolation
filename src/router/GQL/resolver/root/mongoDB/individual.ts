//
//
// This here module is responsible for parsing the request and
// Returning the correct data.
//
//

import { Context } from 'apollo-server-core';
         
import { requestDetails } from '../../main';       

import schemaObject from '../../../../../lexer/types/objects/object';  
import mapResponse from '../../database/mapResponse';    
import mongoService from '../../database/mongoDB';     
import intermediate from './shared';

async function resolve(
    requestDetails: requestDetails,
    schemaObject: schemaObject.init,
    client: mongoService,
    context: Context
) {
    // Process the request
    const processedData =
        await intermediate(requestDetails, schemaObject, client, context);

    // Use the projection and query to get the data
    const data = 
        await processedData.collection.aggregate(
            processedData.requestData
    ).toArray();

    // Check if any data was returned
    if(data.length === 0)
        return undefined;

    // Map the requested resouces back to the schema
    return mapResponse(data[0], schemaObject);
}

export default resolve;