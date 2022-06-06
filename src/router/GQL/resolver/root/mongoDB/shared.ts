         
import { projectionInterface } from '../../database/parseQuery';

import schemaValue from '../../../../../lexer/types/value';   
import schemaObject from '../../../../../lexer/types/objects/object';  
import HookFunction from '../../../../../accessControl/hook';

import preHookProjectionArray from '../../../../../accessControl/processHook';
import mongoService, { mongoResponseObject } from '../../database/mongoDB'   
import { Collection } from 'mongodb';
import { Context } from 'apollo-server-core';
import { groupHooksInterface } from '../../../../../accessControl/groupHooks';
import { internalConfiguration } from '../../../../../general';
import { merge } from '../../../../../merge';
import { requestDetails } from '../../main';
import mapQuery from '../../database/mapQuery';

export type sharedExport = {
    collection: Collection<Document>;
    requestData: Array<{[x: string]: projectionInterface | mongoResponseObject}>;
    projection: projectionInterface;
    hooks: {
        preRequest: {
            [x: string]: groupHooksInterface
        };
        postRequest: {
            [x: string]: groupHooksInterface
        };
        hookOutput: HookFunction.hookPasstrhough;
    };
    values: Array<schemaValue.init>;
};

async function intermediate(
    requestDetails: requestDetails,
    schemaObject: schemaObject.init,
    client: mongoService,
    context: Context,
    isCollection = false
): Promise<sharedExport> {

    // Variable to store the query
    let requestData: Array<{[x: string]: projectionInterface | mongoResponseObject}> = [];

    // ------------[ Process the rawProjection ]------------- //
    // Object to store the projection
    let projection: projectionInterface = {};
    
    let values: Array<schemaValue.init> = [];

    // Access Control Functions
    let hooks: {
        preRequest: { [x: string]: groupHooksInterface };
        postRequest: { [x: string]: groupHooksInterface };
        hookOutput: HookFunction.hookPasstrhough;
    } = {
        preRequest: {},
        postRequest: {},
        hookOutput: {
            maxPageSize: schemaObject?.options?.page?.maxSize ?? internalConfiguration.page.maxSize,
            defPageSize: schemaObject?.options?.page?.defaultSize ?? internalConfiguration.page.defaultSize,
        },
    }


    const paramaters = isCollection === true ? 
        requestDetails.projection[requestDetails.collectionName]?.items : 
        requestDetails.projection[requestDetails.individualName];

    const valueParent = schemaObject.childGetter();

    // Map the requested resouces
    for(const paramater in paramaters) {
        // Get the value
        const value = valueParent.values[paramater];

        // If the paramater is not found in the schema
        // Continue to the next paramater
        if(!value) continue;

        // Check if the schema provided any access control functions
        if(!value.options.accessControl) continue;

        const hookKeys = Object.keys(requestDetails.hookBank);

        // Find the hook in the bank
        for(let i = 0; i < hookKeys.length; i++) {
            const hookKey = hookKeys[i],
                hook = requestDetails.hookBank[hookKey];

            // If the hook is found
            if(!hook) continue;

            // Add the hook to the bank
            switch(hook.execution) {
                case 'postRequest':
                    // check if the hook is already in the bank
                    if(hooks.postRequest[hook.identifier.toString()]) continue;

                    // Add the hook to the bank
                    hooks.postRequest[hook.identifier.toString()] = hook;
                    break;

                case 'preRequest':
                    // check if the hook is already in the bank
                    if(hooks.preRequest[hook.identifier.toString()]) continue;

                    // Add the hook to the bank
                    hooks.preRequest[hook.identifier.toString()] = hook;
                    break;
            }
        }
        
    }

    // Attempt to process the raw query
    const processedQuery = mapQuery(paramaters, schemaObject);

    // If the query is not empty
    if(Object.keys(processedQuery).length !== 0)
        // Add the query to the requestData array
        requestData.push({ $project: processedQuery });
    

    // ------------------------------------------------------- //


    // ---------------[ Manage Hooks ]--------------------- //
    // Get any parameters that were passed in by 
    const fastifyReq = (context as any).rootValue.fastify.req;

    let hookReturns: Array<Promise<projectionInterface>> = [];

    const preRequestHookKeys = Object.keys(hooks.preRequest);


    // Process the hooks
    for (let i = 0; i < preRequestHookKeys.length; i++) {
        // Get the hook
        const hook = hooks.preRequest[preRequestHookKeys[i]];

        // Process the hook
        const hookOutput = preHookProjectionArray({
            hook,
            params: fastifyReq.params,
            headers: fastifyReq.headers,
            value: undefined,
            projection: {
                preSchema: (requestDetails.projection[requestDetails.collectionName] as any)?.items ?? {},
                postSchema: projection,
            }
        });

        // Merge the hook output
        hooks.hookOutput = merge(hooks.hookOutput, hook.hook.passThrough);

        // Add the hook output to the array
        hookReturns.push(hookOutput);
    }

    // Wait for the hooks to finish
    const processedHooks = await Promise.all(hookReturns);

    // Merge the hooks
    //requestData = [...requestData, ...processedHooks];

    // ---------------[ PreRequestHooks ]--------------------- //

    // ------------------------------------ //
    // Get the collection from the database //
    // ------------------------------------ //
    const collection = client.getCollection(
        schemaObject.options.databaseName, 
        schemaObject.options.name
    ); 
    // ------------------------------------ //


    // Finaly, return the data
    return {
        collection,
        requestData,
        projection,
        hooks,
        values,
    }
}

export default intermediate;