//
//
// This here module is responsible for parsing the request and
// Returning the correct data.
//
//

import { Context } from 'apollo-server-core';
import { Resolver } from '../../main.d';
import { internalConfiguration } from '../../../../../general';        

import schemaObject from '../../../../../lexer/types/objects/object';  
import mapResponse from '../../request/mongoDB/mapResponse';    
import mongoService from '../../request/mongoDB/main';     
import intermediate from './shared';
import filter from '../../filter/resolve';

async function resolve(
    requestDetails: Resolver.IRequest,
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



    // variable to store the data
    let reMapedData: Array<any> = [];
    
    // Remap the data
    for(let i = 0; i < data.length; i++) {
        const item = data[i];

        const reMapedItem = mapResponse(item, schemaObject);

        reMapedData.push(reMapedItem);
    }



    // Finally, return the data
    return { 
        [internalConfiguration.defaultValueName]: reMapedData,
        total: data.length,
        max: processedData.hooks.hookOutput.maxPageSize,
        page: pageData.page,
        size: pageData.size,
        pages: Math.ceil(data.length / pageData.size),
    };
}

export default resolve;