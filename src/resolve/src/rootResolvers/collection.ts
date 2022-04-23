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

const resolve = async(
    schemaObject:  SchemaObject.init,
    requestDetails: RequestDetails,
    client: MongoService
): Promise<MongoResponseObject> => {
    // Since this is the collection, the requested data is stored in 'items'
    const rawProjection: ProjectionInterface = requestDetails.projection[requestDetails.collectionName]?.items ?? {};

    // Object to store the projection
    let projection: ProjectionInterface = {};

    // Map the requested resouces
    for(const paramater in rawProjection){
        // Get the value
        const value = schemaObject.obj[paramater];

        // If the paramater is not found in the schema
        // Continue to the next paramater
        if(!value) continue;
        
        // Merge the projections
        _.merge(projection, value.mask);
    }

    // Construct the projection
    const query: MongoResponseObject = mapQuery(
        requestDetails.arguments[requestDetails.collectionName], 
        schemaObject
    );


    const requestData: Array<{[x: string]: ProjectionInterface | MongoResponseObject}> = [
        { $project: projection },
        { $match: query }
    ];

    return new Promise(async(resolve, reject) => {
        resolve({})
    })
}

export default resolve;