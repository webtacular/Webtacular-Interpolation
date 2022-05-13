import schemaObject from '../../parser/types/object';

import parseQuery, { ArgumentsInterface, projectionInterface } from './database/parseQuery';

import { buildSchema } from 'graphql';
import { FilterObject } from '../schema/types';

import schemaValue from '../../parser/types/value';

import individualResolve from './root/mongoDB/individual';
import collectionResolve from './root/mongoDB/collection';

import { Construct } from '../..';
import { Output } from '../schema/parse';
import { groupHooks } from '../../accessControl/groupHooks';
import { internalConfiguration } from '../../general';
import { merge } from '../../merge';

export interface requestDetails {
    collectionName: string;
    individualName: string;

    projection: projectionInterface;
    arguments: ArgumentsInterface

    filter: { [x: string]: FilterObject };
    hookBank: groupHooks;
}

export default function (
    input: schemaObject.init, 
    parsed: Output,
    schema: string, 
    main: Construct.load
) {
    //     
    // 
    // We need a better way to do this, but for now this will do.
    // Once we start cleaning up the code, we can change this.
    // 
    //     
    let resolver = {
        [input.key]: (root:any, args:any, context:any, info:any) => {

            const qt = process.hrtime();

            // Parse the query
            let parsedQuery = parseQuery(context),
                // This object will be used to store the response objects
                returnObject = {};

            // These are the arguments that the user has passed in
            parsedQuery.arguments = parsedQuery.arguments[input.key];

            // These are the arguments that the user has passed in
            parsedQuery.projection = parsedQuery.projection[input.key];

            // This object contains basic information about the schemaObject
            const requestDetails: requestDetails = {
                collectionName: (input.key + 'Collection'),
                individualName: input.key,

                projection: parsedQuery.projection,
                arguments: parsedQuery.arguments,

                filter: parsed.filter,
                hookBank: parsed.hookBank,
            }

            const rootKeys: string[] = Object.keys(parsedQuery.projection);

            for(let i = 0; i < rootKeys.length; i++) {
                const key = rootKeys[i];

                // Check if a root value is requested
                if(key === requestDetails.individualName) returnObject = merge(returnObject, {
                    [key]: individualResolve(input, requestDetails, main.client, context)});
                
                // Check if the requested value is a collection
                else if(key === requestDetails.collectionName) returnObject = merge(returnObject, {
                    [key]: collectionResolve(input, requestDetails, main.client, context)});
            }

            const qtDiff = process.hrtime(qt)

            if(internalConfiguration.debug === true)
                console.log(`Overhead time: ${qtDiff[0] * 1000 + qtDiff[1] / 1000000}ms | Test start: ${qt[0] * 1000 + qt[1] / 1000000}ms | Test end: ${(qt[0] * 1000 + qt[1] / 1000000) + (qtDiff[0] * 1000 + qtDiff[1] / 1000000)}ms`)

            // Finaly, return the data to the user
            return returnObject;
        }
    };


     // Get any parameters that were passed in by 
    // the url eg /users?limit=10 from the context

    // --------------------[ALL OF THIS IS TEMPORARY]-------------------- //
    main.gql.addSchema(buildSchema(`
        type Query {
            ${input.key}: ${input.key}Query
        }
        ${schema}
    `), resolver);
    // --------------------[ALL OF THIS IS TEMPORARY]-------------------- //
}