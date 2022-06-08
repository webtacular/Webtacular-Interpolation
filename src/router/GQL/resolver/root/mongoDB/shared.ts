import mapQuery from '../../request/mongoDB/mapQuery';
import schemaValue from '../../../../../lexer/types/value';   
import schemaObject from '../../../../../lexer/types/objects/object';  
import HookFunction from '../../../../../accessControl/hook';
import mongoService, { mongoResponseObject } from '../../request/mongoDB/main'   

import { Collection } from 'mongodb';
import { Resolver } from '../../main.d';
import { Context } from 'apollo-server-core';
import { internalConfiguration } from '../../../../../general';
import { projectionInterface } from '../../request/parseQuery';
import { groupHooksInterface } from '../../../../../accessControl/groupHooks';
import { IHookReference } from '../../../../../lexer/index.interfaces';
import execPreHook from '../../../../../accessControl/processHook';

export type IHookReturnable = {
    preRequestHooks: { [x: string]: IHookReference }
    postRequestHooks: { [x: string]: IHookReference }
    hookOutput: HookFunction.hookPasstrhough;
}

export type ISharedExport = {
    collection: Collection<Document>;
    requestData: Array<{[x: string]: projectionInterface | mongoResponseObject}>;
    projection: projectionInterface;
    hooks: IHookReturnable;
    values: Array<schemaValue.init>;
};


async function intermediate(
    requestDetails: Resolver.IRequest,
    schemaObject: schemaObject.init,
    client: mongoService,
    context: Context,
    isCollection = false
): Promise<ISharedExport> {

    // Variable to store the query
    let requestData: Array<{[x: string]: projectionInterface | mongoResponseObject}> = [];

    // ------------[ Process the rawProjection ]------------- //
    // Object to store the projection
    let projection: projectionInterface = {};
    
    let values: Array<schemaValue.init> = [];

    // Access Control Functions
    let hookObject: IHookReturnable = {
        preRequestHooks: {},
        postRequestHooks: {},
        hookOutput: {
            // stores values that hooks have requested, eg changeing the max page size that 
            // a user can request
            maxPageSize: schemaObject?.options?.page?.maxSize ?? internalConfiguration.page.maxSize,
            defPageSize: schemaObject?.options?.page?.defaultSize ?? internalConfiguration.page.defaultSize,
        },
    }


    // ---------------[ Proccess Mask ]--------------------- //
    // Get the gql query
    const paramaters = isCollection === true ? 
        requestDetails.projection[requestDetails.collectionName]?.items : 
        requestDetails.projection[requestDetails.individualName];

    // Attempt to process the raw query
    const processedQuery = mapQuery(paramaters, schemaObject);

    // If the query is not empty
    if(Object.keys(processedQuery.mask).length !== 0)
        // Add the query to the requestData array
        requestData.push({ $project: processedQuery.mask });
    // ------------------------------------------------------- //



    // ---------------[ Access controll ]--------------------- //
    const fastifyReq = (context as any).rootValue.fastify.req;

    if(processedQuery.hooks.length > 0) {

        let hooks: { [x: string]: IHookReference } = {};

        // Eliminate duplicates
        for(let i = 0; i < processedQuery.hooks.length; i++) {
            const hook: IHookReference = processedQuery.hooks[i];

            // If the hook is not in the hooks object
            if(hooks[hook.identifier.toString()] === undefined)
                // Add the hook to the hooks object
                hooks[hook.identifier.toString()] = hook;
        }

        // Loop through the hooks
        for(let hookIdentifier in hooks) {
            // Get the hook
            const hook: groupHooksInterface = hooks[hookIdentifier].get();

            // Process the hook if its a pre request hook
            if(hook.execution !== 'preRequest') {
                // Add the hook to the post request hooks
                hookObject.postRequestHooks[hookIdentifier] 
                    = hooks[hookIdentifier];

                // Continue to the next hook
                continue;
            }

            // Execute the hook
            const hookReturnable: projectionInterface = await execPreHook({
                params: fastifyReq.params,
                headers: fastifyReq.headers,
                value: undefined,
                projection: {
                    preMap: paramaters ?? {},
                    postMap: processedQuery.mask,
                },
                hook: hook,
            });

            // Add the hook to the requestData array
            requestData.push({ $project: hookReturnable });

            // Add the hook to the pre request hooks
            hookObject.preRequestHooks[hookIdentifier] 
                = hooks[hookIdentifier];
        }
    }
    // ------------------------------------------------------- //



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
        hooks: hookObject,
        values,
    }
}

export default intermediate;