//
//
// This here module is responsible for parsing the request and
// Returning the correct data.
//
//

import _ from 'lodash';
         
import { requestDetails } from '../..';       
import { internalConfiguration } from '../../../general';        
import { projectionInterface } from '../database/parseQuery';
// import { FuncFilterObject, QueryFilterObject, QueryFilterOutput } from '../../../query/types';

import mapQuery from '../database/mapQuery'; 
import schemaValue from '../../../query/value';   
import schemaObject from '../../../query/object';  
import mapResponse from '../database/mapResponse';    
import processHook from '../accessControl/processHook';    
import schemaFunction from '../accessControl/funcExec';

import mongoService, { mongoResponseObject } from '../database/mongo';     
import groupByFunction, { groupedHookType } from '../accessControl/groupHooks';

const resolve = async(
    schemaObject: schemaObject.init,
    requestDetails: requestDetails,
    client: mongoService,
    context: any
) => {

    // ------------[ Process the rawProjection ]------------- //
    // Since this is the collection, the requested data is stored in 'items'
    const rawProjection: projectionInterface = requestDetails.projection[requestDetails.collectionName]?.items ?? {};

    // Object to store the projection
    let projection: projectionInterface = {};

    // Access Control Functions
    let hooks: schemaFunction.hookMap = [];

    // Map the requested resouces
    for(const paramater in rawProjection){
        // Get the value
        const value: schemaValue.init = schemaObject.obj[paramater] as schemaValue.init;

        // If the paramater is not found in the schema
        // Continue to the next paramater
        if(!value) continue;

        // Check if the schema provided any access control functions
        if(value.options.accessControl) {
            // Load the hooks
            const hookObject = new schemaFunction.init(
                value.options.accessControl, value);

            // Check if the hook is a preRequest hook
            hookObject.hooks.forEach(hook => {

                // Only add the hook if its a view hook
                // as this resolver can only get data
                if(hook.type === 'view') 
                    hooks.push(hook);
            });
        }

        // Merge the projections
        _.merge(projection, value.mask);
    }
    // ------------------------------------------------------- //


    // Variable to store the query
    let requestData: Array<{[x: string]: projectionInterface | mongoResponseObject}> = [];


    // ---------------[ Manage Hooks ]--------------------- //
    const groupedHooks: groupedHookType = groupByFunction(hooks);

    if(groupedHooks.length > 0) {
        
        // Get any parameters that were passed in by 
        const fastifyReq = context.rootValue.fastify.req;

        // Merge all the preHook projections together
        const preHookProjection: projectionInterface = (await processHook({
            projection: {
                preSchema: rawProjection,
                postSchema: projection,
            },
            hooks: groupedHooks,
            params: fastifyReq.query,
            cookies: fastifyReq.cookies,
            headers: fastifyReq.headers,
        })).reduce((acc, curr) => _.merge(acc, curr));
        
        // Push the preHookProjection to the requestData
        requestData.push(preHookProjection);
    }
    // ---------------[ PreRequestHooks ]--------------------- //


    // --------------------[ Projection ]--------------------- //
    // Construct the projection
    const query: mongoResponseObject = mapQuery(
        requestDetails.arguments[requestDetails.collectionName], 
        schemaObject
    );
    
    if(query !== {})
        requestData.push({$match: query});

    if(projection !== {}) 
        requestData.push({ $project: projection });
    // --------------------[ Projection ]--------------------- //

    

    // ------------------------------------ //
    // Get the collection from the database //
    // ------------------------------------ //
    const collection = client.getCollection(
        schemaObject.options.databaseName, 
        schemaObject.options.collectionName
    ); 
    // ------------------------------------ //


    // ------------------------------ //
    // Get the data from the database //
    // ------------------------------ //
    const data = await collection.aggregate([
        ...requestData, 
        //...queryFilters
    ]).toArray();
    // ------------------------------ //


    // variable to store the data
    let reMapedData: Array<any> = [];

    // Remap the data
    data.forEach(item => {
        const reMapedItem = 
            mapResponse(schemaObject, item);

        reMapedData.push(reMapedItem);
    });
    // ---------------------[ Database ]---------------------- //


    // Finally, return the data
    return { [internalConfiguration.defaultValueName]: reMapedData };
}

export default resolve;