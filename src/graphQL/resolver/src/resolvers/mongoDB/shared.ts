import _ from 'lodash';
         
import { requestDetails } from '../../..';       
import { projectionInterface } from '../../database/parseQuery';

import schemaValue from '../../../../schema/value';   
import schemaObject from '../../../../schema/object';  
import HookFunction from '../../../../../accessControl/hook';

import mongoService, { mongoResponseObject } from '../../database/mongoDB'   
import { Collection } from 'mongodb';
import { Context } from 'apollo-server-core';

export type sharedExport = {
    collection: Collection<Document>;
    requestData: Array<{[x: string]: projectionInterface | mongoResponseObject}>;
    projection: projectionInterface;
    hooks: {
        preRequest: HookFunction.hookMap;
        postRequest: HookFunction.hookMap;
    };
};

async function intermediate(
    schemaObject: schemaObject.init,
    requestDetails: requestDetails,
    client: mongoService,
    context: Context,
    isCollection = false
): Promise<sharedExport> {
    // Variable to store the query
    const requestData: Array<{[x: string]: projectionInterface | mongoResponseObject}> = [];

    // ------------[ Process the rawProjection ]------------- //
    // Object to store the projection
    let projection: projectionInterface = {};

    // Access Control Functions
    let hooks: {
        preRequest: HookFunction.hookMap;
        postRequest: HookFunction.hookMap;
    } = {
        preRequest: [],
        postRequest: [],
    }
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const paramaters = isCollection === true ? requestDetails.projection[requestDetails.collectionName]?.items ?? {} : requestDetails.projection[requestDetails.individualName] ?? {};

    console.log(requestDetails.hookBank);
    // Map the requested resouces
    for(const paramater in paramaters){
        // Get the value
        const value: schemaValue.init = schemaObject.obj[paramater] as schemaValue.init;
        
        // If the paramater is not found in the schema
        // Continue to the next paramater
        if(!value) continue;

        // Check if the schema provided any access control functions
        if(value.options.accessControl) {
            // Find the hook in the bank
            
        }

        // Merge the projections
        _.merge(projection, value.mask);
    }

    if(projection !== {})
        requestData.push({ $project: projection });
    // ------------------------------------------------------- //
    

    // ---------------[ Manage Hooks ]--------------------- //
    // // Check if there are any preRequest hooks
    // if(hooks.preRequest.length > 0) {
    //     // Group any existing hooks together
    //     const groupedHooks: groupedHookType = groupByFunction(hooks.preRequest);
        
    //     // Get any parameters that were passed in by 
    //     const fastifyReq = (context as any).rootValue.fastify.req;

    //     // Merge all the preHook projections together
    //     const preHookProjection: projectionInterface = (await processHook({
    //         projection: {
    //             preSchema: (requestDetails.projection[requestDetails.collectionName] as any)?.items ?? {},
    //             postSchema: projection,
    //         },
    //         hooks: groupedHooks,
    //         params: fastifyReq.query,
    //         cookies: fastifyReq.cookies,
    //         headers: fastifyReq.headers,
    //     })).reduce((acc, curr) => _.merge(acc, curr));
        
    //     // Push the preHookProjection to the requestData
    //     if(preHookProjection.length > 0)
    //         requestData.push(preHookProjection);
    // }
    // ---------------[ PreRequestHooks ]--------------------- //


    // ------------------------------------ //
    // Get the collection from the database //
    // ------------------------------------ //
    const collection = client.getCollection(
        schemaObject.options.databaseName, 
        schemaObject.options.collectionName
    ); 
    // ------------------------------------ //

     // Finaly, return the data
    return {
        collection,
        requestData,
        projection,
        hooks,
    }
}

export default intermediate;