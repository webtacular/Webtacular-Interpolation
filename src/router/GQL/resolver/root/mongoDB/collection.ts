//
//
// This here module is responsible for parsing the request and
// Returning the correct data.
//
//

import { Context } from 'apollo-server-core';
         
import { requestDetails } from '../../main';       
import { internalConfiguration } from '../../../../../general';        

import schemaObject from '../../../../../lexer/types/objects/object';  
import mapResponse from '../../database/mapResponse';    
import mongoService from '../../database/mongoDB';     
import intermediate from './shared';
import filter from '../../filter/resolve';

async function resolve(
    requestDetails: requestDetails,
    schemaObject: schemaObject.init,
    client: mongoService,
    context: Context
) {

    // Process the request
    const processedData =
        await intermediate(requestDetails, schemaObject, client, context, true);

    // Process the filters
    const filters = filter(processedData.values, requestDetails.arguments, 'mongo');

    // Arguments from the request
    const args = requestDetails.arguments;
    
    // Get the page data the the user requested
    let pageData = {
        size: args?.pageSize,
        page: isNaN(args?.page) ? 0 : args?.page 
    }

    // Make sure that the user cant request a 
    // page size larger than the max page size
    if(pageData.size > processedData.hooks.hookOutput.maxPageSize)
        pageData.size = processedData.hooks.hookOutput.maxPageSize;

    if(pageData.size === undefined)
        pageData.size = processedData.hooks.hookOutput.defPageSize;

    if(pageData.size < 1)
        pageData.size = 1;

    if(pageData.page < 0)
        pageData.page = 0;
    
    // ------------------------------ //
    // Get the data from the database //
    // ------------------------------ //

    // DEBUG: timer
    const qt = process.hrtime()

    // Get the data from the database
    const data = await processedData.collection.aggregate([
        ...processedData.requestData,
        ...filters,
        {
            $skip: pageData.page * pageData.size
        },
        {
            $limit: pageData.size
        }
    ]).toArray();
    
    // DEBUG: timer
    const qtDiff = process.hrtime(qt)
    
    // DEBUG: timer
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
    return { 
        [internalConfiguration.defaultValueName]: reMapedData,
        total: data.length,
        max: processedData.hooks.hookOutput.maxPageSize,
        page: pageData.page,
        size: pageData.size,
    };
}

export default resolve;