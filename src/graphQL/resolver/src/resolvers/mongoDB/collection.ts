//
//
// This here module is responsible for parsing the request and
// Returning the correct data.
//
//

import { Context } from 'apollo-server-core';
import _ from 'lodash';
         
import { requestDetails } from '../../..';       
import { internalConfiguration } from '../../../../../general';        

import schemaObject from '../../../../schema/object';  
import mapResponse from '../../database/mapResponse';    
import mongoService from '../../database/mongoDB';     
import intermediate from './shared';

async function resolve(
    schemaObject: schemaObject.init,
    requestDetails: requestDetails,
    client: mongoService,
    context: Context
) {
    // Process the request
    const processedData =
        await intermediate(schemaObject, requestDetails, client, context, true);

    // ------------------------------ //
    // Get the data from the database //
    // ------------------------------ //
    const data = await processedData.collection.aggregate([
        ...processedData.requestData, 
    ]).toArray();
    // ------------------------------ //

    // variable to store the data
    let reMapedData: Array<any> = [];

    // Remap the data
    for(let i = 0; i < data.length; i++) {
        const item = data[i];

        const reMapedItem = mapResponse(schemaObject, item);

        reMapedData.push(reMapedItem);
    }

    // Finally, return the data
    return { [internalConfiguration.defaultValueName]: reMapedData };
}

export default resolve;