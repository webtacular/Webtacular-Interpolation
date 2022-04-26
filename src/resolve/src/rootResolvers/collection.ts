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

const resolve = async(
    schemaObject:  SchemaObject.init,
    requestDetails: RequestDetails,
    client: MongoService
) => {

    // ---------------[ Process the rawProjection ]---------------- //
    // Since this is the collection, the requested data is stored in 'items'
    const rawProjection: ProjectionInterface = requestDetails.projection[requestDetails.collectionName]?.items ?? {};

    // Object to store the projection
    let projection: ProjectionInterface = {};

    // Map the requested resouces
    for(const paramater in rawProjection){
        // Get the value
        const value = schemaObject.obj[paramater] as SchemaValue.init;

        // If the paramater is not found in the schema
        // Continue to the next paramater
        if(!value) continue;
        
        // Merge the projections
        _.merge(projection, value.mask);
    }
    // ------------------------------------------------------------ //

    
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

    const requestData: Array<{[x: string]: ProjectionInterface | MongoResponseObject}> = [
        { $project: projection },
        { $match: query },
    ];

    const collection = client.getCollection(schemaObject.options.databaseName, schemaObject.options.collectionName); 
    // TODO: We are generalizing this, ^^ This should account for the fact that some values request data from multiple collections.

    // Use the projection and query to get the data
    const data = await collection.aggregate([...requestData, ...queryFilters]).toArray();

    // Remap the data
    data.forEach(item => 
        item = mapResponse(schemaObject, item));

    // Finally, return the data
    return { [internalConfiguration.defaultValueName]: data };
}

export default resolve;