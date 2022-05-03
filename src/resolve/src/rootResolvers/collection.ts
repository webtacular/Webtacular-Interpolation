//
//
// This here module is responsible for parsing the request and
// Returning the correct data.
//
//

import _ from "lodash";

import SchemaObject from '../../../query/object';           
import MongoService, { MongoResponseObject } from '../database/mongo';                 

import mapResponse from '../database/mapResponse';        
import mapQuery from '../database/mapQuery';           

import { RequestDetails } from '../..';               
import { ProjectionInterface } from "../database/parseQuery";
// import { FuncFilterObject, QueryFilterObject, QueryFilterOutput } from "../../../query/types";
import { internalConfiguration } from "../../../general";

import SchemaValue from "../../../query/value";
import SchemaFunction from "../accessControl/funcExec";
import groupByFunction, { groupedHookType } from "../accessControl/groupHooks";
import processHook from "../accessControl/processHook";

const resolve = async(
    schemaObject:  SchemaObject.init,
    requestDetails: RequestDetails,
    client: MongoService,
    context: any
) => {

    // ------------[ Process the rawProjection ]------------- //
    // Since this is the collection, the requested data is stored in 'items'
    const rawProjection: ProjectionInterface = requestDetails.projection[requestDetails.collectionName]?.items ?? {};

    // Object to store the projection
    let projection: ProjectionInterface = {};

    // Access Control Functions
    let hooks: SchemaFunction.hookMap = [];

    // Map the requested resouces
    for(const paramater in rawProjection){
        // Get the value
        const value: SchemaValue.init = schemaObject.obj[paramater] as SchemaValue.init;

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
                if(hook.type === 'view') 
                    hooks.push(hook);
            });
        }

        // Merge the projections
        _.merge(projection, value.mask);
    }
    // ------------------------------------------------------- //


    // Variable to store the query
    let requestData: Array<{[x: string]: ProjectionInterface | MongoResponseObject}> = [];


    // ---------------[ Manage Hooks ]--------------------- //
    const groupedHooks: groupedHookType = groupByFunction(hooks);

    if(groupedHooks.length > 0) {
        
        // Get any parameters that were passed in by 
        const fastifyReq = context.rootValue.fastify.req;

        // Merge all the preHook projections together
        const preHookProjection: ProjectionInterface = (await processHook({
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
    const query: MongoResponseObject = mapQuery(
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