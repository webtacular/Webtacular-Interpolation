import _ from 'lodash';
         
import { requestDetails } from '../../..';       
import { projectionInterface } from '../../database/parseQuery';

import schemaValue from '../../../../schema/value';   
import schemaObject from '../../../../schema/object';  
import processHook from '../../accessControl/processHook';    
import schemaFunction from '../../accessControl/funcExec';

import mongoService, { mongoResponseObject } from '../../database/mongoDB/mongo';     
import groupByFunction, { groupedHookType } from '../../accessControl/groupHooks';
import { Collection } from 'mongodb';
import { Context } from 'apollo-server-core';

const intermediate = async(
    schemaObject: schemaObject.init,
    requestDetails: requestDetails,
    client: mongoService,
    context: Context,
    isCollection = false
): Promise<{
    collection: Collection<Document>;
    requestData: Array<{[x: string]: projectionInterface | mongoResponseObject}>;
    projection: projectionInterface;
    hooks: schemaFunction.hookMap;
}> => {
    // Variable to store the query
    const requestData: Array<{[x: string]: projectionInterface | mongoResponseObject}> = [];

    // ------------[ Process the rawProjection ]------------- //
    // Object to store the projection
    const projection: projectionInterface = {};

    // Access Control Functions
    const hooks: schemaFunction.hookMap = [];
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const paramaters = isCollection === true ? (requestDetails.projection[requestDetails.collectionName] as any)?.items ?? {} : requestDetails.projection[requestDetails.individualName] ?? {};

    // Map the requested resouces
    for(const paramater in paramaters){
        // Get the value
        const value: schemaValue.init = schemaObject.obj[paramater] as schemaValue.init;

        // If the paramater is not found in the schema
        // Continue to the next paramater
        if(!value) continue;

        // Check if the schema provided any access control functions
        if(value.options.accessControl) {
            // Load the hooks
            const hookObject = new schemaFunction.init(value.options.accessControl, value);

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
    
    if(projection !== {})
        requestData.push({ $project: projection });
    // ------------------------------------------------------- //
    

    // ---------------[ Manage Hooks ]--------------------- //
    // Check if there are any preRequest hooks
    if(hooks.length > 0) {
        // Group any existing hooks together
        const groupedHooks: groupedHookType = groupByFunction(hooks);
        
        // Get any parameters that were passed in by 
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const fastifyReq = (context as any).rootValue.fastify.req;

        // Merge all the preHook projections together
        const preHookProjection: projectionInterface = (await processHook({
            projection: {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                preSchema: (requestDetails.projection[requestDetails.collectionName] as any)?.items ?? {},
                postSchema: projection,
            },
            hooks: groupedHooks,
            params: fastifyReq.query,
            cookies: fastifyReq.cookies,
            headers: fastifyReq.headers,
        })).reduce((acc, curr) => _.merge(acc, curr));
        
        // Push the preHookProjection to the requestData
        if(preHookProjection.length > 0)
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            requestData.push(preHookProjection);
    }
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