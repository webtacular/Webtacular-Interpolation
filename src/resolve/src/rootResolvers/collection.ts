//
//
// This here module is responsible for parsing the request and
// Returning the correct data.
//
//

import _ from "lodash";

import SchemaObject from '../../../query/object';            // [Namespace] //
import MongoService from '../database';                      // [Interface] //

import mapResponse from '../database/mapResponse';           // [Func] //
import mapQuery from '../database/mapQuery';                 // [Func] //

import { MongoResponseObject } from '../database/interface'; // [Interface] //
import { RequestDetails } from '../..';                      // [Interface] //
import { ProjectionInterface } from "../database/parseQuery";
import { FuncFilterObject, QueryFilterObject, QueryFilterOutput } from "../../../query/types";
import { internalConfiguration } from "../../../general";

import SchemaValue from "../../../query/value";
import SchemaFunction from "../accessControl/funcExec";
import groupByFunction from "../accessControl/groupHooks";
import execGroupedHook from "../accessControl/execGroupedHook";

const resolve = async(
    schemaObject:  SchemaObject.init,
    requestDetails: RequestDetails,
    client: MongoService,
    context: any
) => {

    // ---------------[ Process the rawProjection ]---------------- //
    // Since this is the collection, the requested data is stored in 'items'
    const rawProjection: ProjectionInterface = requestDetails.projection[requestDetails.collectionName]?.items ?? {};

    // Object to store the projection
    let projection: ProjectionInterface = {};

    // Access Control Functions
    let preRequest: SchemaFunction.hookMap = [],
        postRequest: SchemaFunction.hookMap = [];

    // Map the requested resouces
    for(const paramater in rawProjection){
        // Get the value
        const value = schemaObject.obj[paramater] as SchemaValue.init;

        // If the paramater is not found in the schema
        // Continue to the next paramater
        if(!value) continue;

        // Check if the schema provided any access control functions
        if(value.options.accessControl) {
            // Load the hooks
            const hookObject = new SchemaFunction.init(
                value.options.accessControl, value);

            // Check if the hook is a preRequest hook
            hookObject.hooks.forEach(hook => {

                // Only add the hook if its a view hook
                // as this resolver can only get data
                if(hook.type === 'view') { 
                    if(hook.hook.opts.preRequest === true)
                        preRequest.push(hook);

                    else postRequest.push(hook);
                }
            });
        }

        // Merge the projections
        _.merge(projection, value.mask);
    }
    // ------------------------------------------------------------ //

    const groupedPreHooks = groupByFunction(preRequest),
        groupedPostHooks = groupByFunction(postRequest);

    // Get any parameters that were passed in by 
    const fastifyReq = context.rootValue.fastify.req;

    // Get the query parameters
    const queryParams = fastifyReq.query,
    // Get the query cookies
        queryCookies = fastifyReq.cookies;

    // Process all the preRequest hooks
    const preHookProjectionArray: Array<ProjectionInterface> = await new Promise(async(resolve) => {
        // Promise array to store the projection promises
        let promiseArray: Array<Promise<ProjectionInterface>> = [];

        // Go through each preRequest hook and execute it
        groupedPreHooks.forEach(async(hooks) => promiseArray.push(execGroupedHook(hooks, {
            urlParams: queryParams,
            cookies: queryCookies,

            projection: {
                preSchema: rawProjection,
                postSchema: projection,
            },
        })));

        // Resolve the array of promises
        return resolve(await Promise.all(promiseArray));
    });

    // Merge all the preHook projections together
    const preHookProjection: ProjectionInterface = preHookProjectionArray.reduce((acc, curr) => _.merge(acc, curr));

    // ---------------[ Process the rawFilter ]---------------- //
    // Get the filter for the request
    const rawFilter = requestDetails.arguments[requestDetails.collectionName]?.filter ?? {};
    
    // Object to store the filter
    let functionFiltersObjects: { [x: string]: FuncFilterObject } = {};

    let queryFiltersObjects: { [x: string]: QueryFilterObject } = {},
        queryFilters: Array<QueryFilterOutput> = [];

    // Map the requested resouces
    for(const filterName in rawFilter){
        // Get the value
        const value: FuncFilterObject | QueryFilterObject | undefined = 
            requestDetails.filter[filterName];

        // If the filter is not found in the schema
        // Continue to the next filter
        if(!value) continue;

        // sort the filters
        switch(value.type) {
            case 'function':
                functionFiltersObjects[filterName] = value;
                break;

            case 'query':
                queryFiltersObjects[filterName] = value as QueryFilterObject;

                queryFilters.push(value.func(rawFilter[filterName], value));
                break;

            default:
                continue;
        }
    }
    // -------------------------------------------------------- //

    // Construct the projection
    const query: MongoResponseObject = mapQuery(
        requestDetails.arguments[requestDetails.collectionName], 
        schemaObject
    );

    let requestData: Array<{[x: string]: ProjectionInterface | MongoResponseObject}> = [
        { $match: query },
    ];

    if(Object.keys(preHookProjection).length > 0) 
        requestData.push({ $project: preHookProjection });

    if(Object.keys(projection).length > 0) 
        requestData.push({ $project: projection });

    const collection = client.getCollection(schemaObject.options.databaseName, schemaObject.options.collectionName); 

    // Use the projection and query to get the data
    const data = await collection.aggregate([...requestData, ...queryFilters]).toArray();

    let reMapedData: Array<any> = [];

    // Remap the data
    data.forEach(item => 
        reMapedData.push(mapResponse(schemaObject, item)));

    // Finally, return the data
    return { [internalConfiguration.defaultValueName]: reMapedData };
}

export default resolve;