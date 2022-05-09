//
//
// This here module is responsible for parsing the request and
// Returning the correct data.
//
//

import { Context } from 'apollo-server-core';
import _ from 'lodash';
         
import { requestDetails } from '../../main';       
import { internalConfiguration } from '../../../../general';        

import schemaObject from '../../../schema/object';  
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

    const qt = process.hrtime()

    const data = await processedData.collection.aggregate(
        processedData.requestData, 
    ).toArray();

    const qtDiff = process.hrtime(qt)

    if(internalConfiguration.debug === true)
        console.log(`Query time: ${qtDiff[0] * 1000 + qtDiff[1] / 1000000}ms | Test start ${qt[0] * 1000 + qt[1] / 1000000}ms | Test end: ${(qt[0] * 1000 + qt[1] / 1000000) + (qtDiff[0] * 1000 + qtDiff[1] / 1000000)}ms`)
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